import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { KycModule } from '../kyc/kyc.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [KycModule, NotificationsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
