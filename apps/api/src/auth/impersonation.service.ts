import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface ImpersonationPayload {
  sub: string;
  impersonatedBy: string;
  isImpersonation: true;
}

// Signed with our own IMPERSONATION_JWT_SECRET (HS256, via @nestjs/jwt), not
// Supabase's key -- we have no way to mint a token Supabase's JWKS would
// accept, since that's an asymmetric key we don't hold. AuthGuard tries
// Supabase verification first and falls back to this for any token that
// isn't one of theirs (a real Supabase JWT can never verify here and vice
// versa, so there's no ambiguity between the two paths).
@Injectable()
export class ImpersonationService {
  constructor(private readonly jwt: JwtService) {}

  sign(targetUserId: string, adminId: string): string {
    return this.jwt.sign(
      { sub: targetUserId, impersonatedBy: adminId, isImpersonation: true },
      { expiresIn: '1h' },
    );
  }

  verify(token: string): ImpersonationPayload {
    return this.jwt.verify<ImpersonationPayload>(token);
  }
}
