import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { EarlyAccessModule } from './early-access/early-access.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ThrottlerGuard applies every named throttler below to every route; `short`/`long`
    // are effectively unlimited by default and only tightened via @Throttle() on the
    // specific OTP routes that need a dual per-minute + per-hour limit.
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'short', ttl: 60000, limit: 1000 },
      { name: 'long', ttl: 3600000, limit: 1000 },
    ]),
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
    EarlyAccessModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
