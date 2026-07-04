import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';
import { Enquiry } from '../enquiries/enquiry.entity';
import { Order } from '../orders/order.entity';
import { Material } from '../materials/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contractor, Labour, Enquiry, Order, Material])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
