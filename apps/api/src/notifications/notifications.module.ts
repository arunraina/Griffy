import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { WhatsappSenderService } from './whatsapp-sender.service';
import { EmailService } from './email.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, WhatsappSenderService, EmailService],
  exports: [NotificationsService, WhatsappSenderService],
})
export class NotificationsModule {}
