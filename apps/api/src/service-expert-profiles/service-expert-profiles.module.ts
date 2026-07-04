import { Module } from '@nestjs/common';
import { ServiceExpertProfilesController } from './service-expert-profiles.controller';
import { ServiceExpertProfilesService } from './service-expert-profiles.service';

@Module({
  controllers: [ServiceExpertProfilesController],
  providers: [ServiceExpertProfilesService],
  exports: [ServiceExpertProfilesService],
})
export class ServiceExpertProfilesModule {}
