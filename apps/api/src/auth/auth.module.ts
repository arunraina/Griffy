import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { FirebasePhoneAuthService } from './firebase-phone-auth.service';
import { ImpersonationService } from './impersonation.service';

// @Global() formalizes what was already true in practice -- AuthGuard's own
// deps (ConfigService, PrismaService) are both global, so every module using
// @UseGuards(AuthGuard) without importing AuthModule already worked. Now
// that AuthGuard also depends on ImpersonationService (itself depending on
// JwtService), that chain needs to resolve the same way everywhere too.
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('IMPERSONATION_JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthGuard, FirebasePhoneAuthService, ImpersonationService],
  exports: [AuthGuard, ImpersonationService],
})
export class AuthModule {}
