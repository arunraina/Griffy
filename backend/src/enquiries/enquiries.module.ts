import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnquiriesService } from './enquiries.service';
import { EnquiriesController } from './enquiries.controller';
import { Enquiry } from './enquiry.entity';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enquiry, Contractor, Labour])],
  providers: [EnquiriesService],
  controllers: [EnquiriesController],
})
export class EnquiriesModule {}
