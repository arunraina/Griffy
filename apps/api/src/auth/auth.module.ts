import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { FirebasePhoneAuthService } from './firebase-phone-auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthGuard, FirebasePhoneAuthService],
  exports: [AuthGuard],
})
export class AuthModule {}
