import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { WhatsappOtpService } from './whatsapp-otp.service';

@Module({
  controllers: [AuthController],
  providers: [AuthGuard, WhatsappOtpService],
  exports: [AuthGuard],
})
export class AuthModule {}
