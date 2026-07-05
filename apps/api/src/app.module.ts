import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContractorProfilesModule } from './contractor-profiles/contractor-profiles.module';
import { LabourProfilesModule } from './labour-profiles/labour-profiles.module';
import { ServiceExpertProfilesModule } from './service-expert-profiles/service-expert-profiles.module';
import { MaterialSupplierProfilesModule } from './material-supplier-profiles/material-supplier-profiles.module';
import { LandOwnerProfilesModule } from './land-owner-profiles/land-owner-profiles.module';
import { PropertySellerProfilesModule } from './property-seller-profiles/property-seller-profiles.module';
import { BuilderProfilesModule } from './builder-profiles/builder-profiles.module';
import { PropertyAgentProfilesModule } from './property-agent-profiles/property-agent-profiles.module';
import { MaterialsModule } from './materials/materials.module';
import { OrdersModule } from './orders/orders.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LandsModule } from './lands/lands.module';
import { PropertiesModule } from './properties/properties.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProjectsModule } from './projects/projects.module';
import { CareerApplicationsModule } from './career-applications/career-applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ContractorProfilesModule,
    LabourProfilesModule,
    ServiceExpertProfilesModule,
    MaterialSupplierProfilesModule,
    LandOwnerProfilesModule,
    PropertySellerProfilesModule,
    BuilderProfilesModule,
    PropertyAgentProfilesModule,
    MaterialsModule,
    OrdersModule,
    BookingsModule,
    ReviewsModule,
    LandsModule,
    PropertiesModule,
    AdminModule,
    PaymentsModule,
    StorageModule,
    NotificationsModule,
    ProjectsModule,
    CareerApplicationsModule,
  ],
})
export class AppModule {}
