import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

// Route prefixes gated by RESTRICTED_LISTING -- a supplier/provider can still
// browse and transact as a customer, just not publish or edit their own
// listings while restricted.
const LISTING_PATH_PREFIXES = [
  '/api/v1/materials',
  '/api/v1/service-items',
  '/api/v1/properties',
  '/api/v1/lands',
  '/api/v1/contractor-profiles',
  '/api/v1/labour-profiles',
  '/api/v1/service-expert-profiles',
];

// The one write RESTRICTED_EXPLORE/PENDING_REVIEW still allow -- editing your
// own basic profile (name/city/phone/etc, see UsersController.updateMe).
// Narrower than "any profile edit": per-role listing profiles (contractor-
// profiles/:id etc.) are still writes and stay blocked under these statuses.
function isOwnProfileUpdate(path: string, method: string): boolean {
  return method === 'PATCH' && path === '/api/v1/users/me';
}

function matchesAnyPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

// Signup writes role/pro_label into Supabase user_metadata using its own
// legacy scheme (CUSTOMER/SERVICE_PROVIDER/...), not the real Prisma
// UserRole enum — this maps one to the other. ADMIN is deliberately never
// derived from client-supplied metadata: a user can call
// `supabase.auth.updateUser({ data: { role: 'ADMIN' } })` from the browser
// console, so trusting it here would be a privilege-escalation hole.
// Admin accounts must be granted via UsersService.setRole by an existing admin.
const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  CUSTOMER: 'HOMEOWNER',
  MATERIAL_SELLER: 'MATERIAL_SUPPLIER',
  LAND_OWNER: 'LAND_OWNER',
  PROPERTY_SELLER: 'PROPERTY_SELLER',
  BUILDER: 'BUILDER',
  PROPERTY_AGENT: 'PROPERTY_AGENT',
};

// The fields we actually use off a verified Supabase access token — narrower
// than @supabase/supabase-js's full User type, which we no longer fetch (see
// the comment on the jwks field below for why).
interface VerifiedSupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, unknown>;
}

@Injectable()
export class AuthGuard implements CanActivate {
  // Verifies the JWT's signature locally against the project's public
  // signing key instead of calling supabase.auth.getUser(token) — that was
  // a network round-trip to Supabase's Auth API on every single protected
  // request, measured taking 5-9s routinely under load (and considerably
  // longer, or outright failing, when several protected requests fire
  // concurrently, which every authenticated page load does). That round
  // trip is exactly what was making /dashboard, /admin, and the homepage
  // hang or error for logged-in users. This is Supabase's own recommended
  // approach for projects on asymmetric (ES256) signing keys — see
  // https://supabase.com/docs/guides/auth/jwts. `createRemoteJWKSet` caches
  // the key set and only refetches on a cache miss (e.g. key rotation), not
  // per request.
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = config.getOrThrow('SUPABASE_URL');
    this.jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    let user: VerifiedSupabaseUser;
    try {
      const { payload } = await jwtVerify(token, this.jwks);
      user = {
        id: payload.sub!,
        email: payload.email as string | undefined,
        phone: payload.phone as string | undefined,
        user_metadata: payload.user_metadata as Record<string, unknown> | undefined,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const referredById = await this.resolveReferrer(user.user_metadata?.referral_code as string | undefined);

    const dbUser = await this.upsertUser(user, referredById);

    const response = context.switchToHttp().getResponse<Response>();
    this.enforceAccountStatus(dbUser, request, response);

    (request as Request & { supabaseUser: VerifiedSupabaseUser; dbUser: User }).supabaseUser = user;
    (request as Request & { supabaseUser: VerifiedSupabaseUser; dbUser: User }).dbUser = dbUser;
    return true;
  }

  // Enforced on every authenticated request, not just the ones each
  // restriction targets -- a suspended/restricted account's *read* access is
  // fine (or fully blocked, for SUSPENDED/TEMP_SUSPENDED), but nothing here
  // resembles a per-route guard: it's one status check central to every
  // request, mirroring how `isSuspended` worked before AccountStatus existed.
  private enforceAccountStatus(dbUser: User, request: Request, response: Response): void {
    const status = dbUser.accountStatus;
    const path = request.path;
    const method = request.method;
    const isWrite = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

    if (status === 'SUSPENDED') {
      throw new ForbiddenException({
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Contact support@griffy.in if you believe this is an error.',
      });
    }

    if (status === 'TEMP_SUSPENDED') {
      throw new ForbiddenException({
        code: 'ACCOUNT_TEMP_SUSPENDED',
        message: `Your account is temporarily suspended until ${dbUser.statusExpiresAt?.toISOString()}.`,
        expiresAt: dbUser.statusExpiresAt,
      });
    }

    if (status === 'RESTRICTED_LISTING' && isWrite && matchesAnyPrefix(path, LISTING_PATH_PREFIXES)) {
      throw new ForbiddenException({
        code: 'LISTING_RESTRICTED',
        message: 'Your listing privileges are temporarily restricted.',
      });
    }

    if (status === 'RESTRICTED_BOOKING' && matchesAnyPrefix(path, ['/api/v1/bookings'])) {
      const isIncomingList = method === 'GET' && path.startsWith('/api/v1/bookings/incoming');
      const isNewBooking = method === 'POST' && path === '/api/v1/bookings';
      if (isIncomingList || isNewBooking) {
        throw new ForbiddenException({
          code: 'BOOKING_RESTRICTED',
          message: 'You will not receive new booking requests temporarily.',
        });
      }
    }

    if ((status === 'RESTRICTED_EXPLORE' || status === 'PENDING_REVIEW') && isWrite && !isOwnProfileUpdate(path, method)) {
      throw new ForbiddenException({
        code: status === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'EXPLORE_ONLY',
        message:
          status === 'PENDING_REVIEW'
            ? 'Your account is under review by our team. You can still browse the platform.'
            : 'Your account is in explore-only mode and cannot make changes right now.',
      });
    }

    if (status === 'PENDING_REVIEW') {
      response.setHeader('X-Account-Status', 'pending_review');
    }
  }

  // A brand-new user's very first authenticated request often isn't alone —
  // the browser fires several requests in parallel right after login (e.g.
  // dashboard mount kicks off fetchMe(), a bookings/orders fetch, and the
  // notification bell's unread-count check nearly simultaneously). Every one
  // of them hits this same upsert for a row that doesn't exist yet, and
  // Postgres only lets one concurrent INSERT win — the other upsert calls
  // can come back as "required to return data, but found no record(s))"
  // instead of cleanly resolving to the winner's row. Retry as a plain
  // lookup in that case; by then the row certainly exists.
  private async upsertUser(user: VerifiedSupabaseUser, referredById: string | undefined): Promise<User> {
    try {
      // The common case, by far, is that this row already exists — check that
      // first so every authenticated request doesn't pay for the ghost lookup
      // below. Only a first-ever login for this Supabase id falls through.
      const existing = await this.prisma.user.findUnique({ where: { id: user.id } });
      if (existing) return await this.trackLogin(existing);

      const claimed = await this.claimGhostUser(user);
      if (claimed) return await this.trackLogin(claimed);

      const created = await this.prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email!,
          name:
            (user.user_metadata?.name as string | undefined) ??
            (user.user_metadata?.full_name as string | undefined) ??
            user.email!.split('@')[0],
          phone: (user.phone as string | undefined) || null,
          role: this.resolveRole(user.user_metadata),
          referredById,
        },
        update: {},
      });
      return await this.trackLogin(created);
    } catch {
      const existing = await this.prisma.user.findUnique({ where: { id: user.id } });
      if (existing) return existing;
      throw new UnauthorizedException('Could not resolve user account');
    }
  }

  // Shared by every path in upsertUser (existing row, claimed ghost, or
  // freshly created) so "first login ever" and session counting are defined
  // in exactly one place. Debounced to once per ~30min: several requests
  // fire in parallel right after login (see the comment above upsertUser),
  // and without debouncing loginCount would over-increment per page load
  // instead of per session. Downstream, loginCount <= 1 means "first login".
  private async trackLogin(user: User): Promise<User> {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (user.lastLoginAt && user.lastLoginAt >= thirtyMinAgo) return user;
    return this.prisma.user.update({
      where: { id: user.id },
      data: { loginCount: { increment: 1 }, lastLoginAt: new Date() },
    });
  }

  // An admin can pre-seed a supply-side provider (e.g. an electrician the team
  // recruited directly) before that person ever signs up — see
  // AdminService.createUser(). When they do sign up for real via phone OTP,
  // re-key that same ghost row onto their real Supabase id instead of leaving
  // it orphaned and creating a second, empty account. Matched on phone only —
  // it's the one channel Firebase OTP actually verifies at this point; email
  // isn't. `User.id` has no DB default and every FK referencing it already
  // cascades on update (verified against the live schema), so this is a plain
  // update, not a copy — any bookings/reviews/messages already made against
  // the ghost profile move with it automatically.
  private async claimGhostUser(user: VerifiedSupabaseUser): Promise<User | undefined> {
    if (!user.phone) return undefined;
    const ghost = await this.prisma.user.findFirst({ where: { isGhost: true, phone: user.phone } });
    if (!ghost) return undefined;
    return this.prisma.user.update({ where: { id: ghost.id }, data: { id: user.id, isGhost: false } });
  }

  private extractBearerToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }

  // See LEGACY_ROLE_MAP above for why this exists and why ADMIN is excluded.
  private resolveRole(metadata: Record<string, unknown> | undefined): UserRole {
    const rawRole = metadata?.role as string | undefined;
    if (!rawRole) return 'HOMEOWNER';

    if (rawRole === 'SERVICE_PROVIDER') {
      const proLabel = (metadata?.pro_label as string | undefined) ?? '';
      if (proLabel.includes('Contractor')) return 'CONTRACTOR';
      if (proLabel.includes('Labour')) return 'LABOUR';
      if (proLabel.includes('Service Expert')) return 'SERVICE_EXPERT';
      return 'HOMEOWNER';
    }

    return LEGACY_ROLE_MAP[rawRole] ?? 'HOMEOWNER';
  }

  // Referral codes are the first 8 chars of a user's id (see UsersService.getReferralStats) —
  // no separate code storage/generation needed, just a prefix lookup.
  private async resolveReferrer(code: string | undefined): Promise<string | undefined> {
    if (!code) return undefined;
    const referrer = await this.prisma.user.findFirst({
      where: { id: { startsWith: code.toLowerCase() } },
      select: { id: true },
    });
    return referrer?.id;
  }
}
