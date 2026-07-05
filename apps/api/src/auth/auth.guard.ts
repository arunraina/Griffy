import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Request } from 'express';
import ws from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

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

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.supabase = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { realtime: { transport: ws as any } },
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) throw new UnauthorizedException('Invalid token');

    const referredById = await this.resolveReferrer(user.user_metadata?.referral_code as string | undefined);

    const dbUser = await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email!,
        name:
          (user.user_metadata?.name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          user.email!.split('@')[0],
        phone: (user.phone as string | undefined) ?? null,
        role: this.resolveRole(user.user_metadata),
        referredById,
      },
      update: {},
    });

    if (dbUser.isSuspended) throw new UnauthorizedException('This account has been suspended');

    (request as Request & { supabaseUser: SupabaseUser; dbUser: User }).supabaseUser = user;
    (request as Request & { supabaseUser: SupabaseUser; dbUser: User }).dbUser = dbUser;
    return true;
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
