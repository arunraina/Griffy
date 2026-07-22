import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Set by AuthGuard only when the bearer token is an impersonation token --
// the acting Super Admin's id, while @CurrentUser() resolves to the
// impersonated target. undefined for a normal (non-impersonated) request.
export const ImpersonatedBy = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.impersonatedBy;
  },
);
