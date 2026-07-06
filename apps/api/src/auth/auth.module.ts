import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { WhatsappOtpService } from './whatsapp-otp.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AuthController],
  providers: [AuthGuard, WhatsappOtpService],
  exports: [AuthGuard],
})
export class AuthModule {}
