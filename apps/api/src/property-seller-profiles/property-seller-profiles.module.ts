import { Module } from '@nestjs/common';
import { PropertySellerProfilesController } from './property-seller-profiles.controller';
import { PropertySellerProfilesService } from './property-seller-profiles.service';

@Module({
  controllers: [PropertySellerProfilesController],
  providers: [PropertySellerProfilesService],
  exports: [PropertySellerProfilesService],
})
export class PropertySellerProfilesModule {}
