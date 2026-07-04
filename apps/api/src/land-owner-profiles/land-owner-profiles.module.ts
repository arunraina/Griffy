import { Module } from '@nestjs/common';
import { LandOwnerProfilesController } from './land-owner-profiles.controller';
import { LandOwnerProfilesService } from './land-owner-profiles.service';

@Module({
  controllers: [LandOwnerProfilesController],
  providers: [LandOwnerProfilesService],
  exports: [LandOwnerProfilesService],
})
export class LandOwnerProfilesModule {}
