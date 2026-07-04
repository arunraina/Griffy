import { Module } from '@nestjs/common';
import { LabourProfilesController } from './labour-profiles.controller';
import { LabourProfilesService } from './labour-profiles.service';

@Module({
  controllers: [LabourProfilesController],
  providers: [LabourProfilesService],
  exports: [LabourProfilesService],
})
export class LabourProfilesModule {}
