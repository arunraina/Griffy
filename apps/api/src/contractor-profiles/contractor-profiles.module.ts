import { Module } from '@nestjs/common';
import { ContractorProfilesController } from './contractor-profiles.controller';
import { ContractorProfilesService } from './contractor-profiles.service';

@Module({
  controllers: [ContractorProfilesController],
  providers: [ContractorProfilesService],
  exports: [ContractorProfilesService],
})
export class ContractorProfilesModule {}
