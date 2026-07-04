import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnquiriesService } from './enquiries.service';
import { EnquiriesController } from './enquiries.controller';
import { Enquiry } from './enquiry.entity';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Enquiry, Contractor, Labour]), NotificationsModule, EmailModule, UsersModule],
  providers: [EnquiriesService],
  controllers: [EnquiriesController],
})
export class EnquiriesModule {}
