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
import { User } from '@prisma/client';

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
        name: (user.user_metadata?.full_name as string | undefined) ?? user.email!.split('@')[0],
        phone: (user.phone as string | undefined) ?? null,
        role: 'HOMEOWNER',
        referredById,
      },
      update: {},
    });

    (request as Request & { supabaseUser: SupabaseUser; dbUser: User }).supabaseUser = user;
    (request as Request & { supabaseUser: SupabaseUser; dbUser: User }).dbUser = dbUser;
    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
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
