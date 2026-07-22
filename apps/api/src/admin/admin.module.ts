import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminHierarchyService } from './admin-hierarchy.service';
import { KycModule } from '../kyc/kyc.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { ReportsModule } from '../reports/reports.module';
import { MaterialsModule } from '../materials/materials.module';
import { LandsModule } from '../lands/lands.module';
import { PropertiesModule } from '../properties/properties.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { ServiceItemsModule } from '../service-items/service-items.module';
import { BookingsModule } from '../bookings/bookings.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    KycModule, NotificationsModule, PaymentsModule, ReportsModule,
    MaterialsModule, LandsModule, PropertiesModule, PortfolioModule, ServiceItemsModule,
    BookingsModule, ReviewsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminHierarchyService],
})
export class AdminModule {}
