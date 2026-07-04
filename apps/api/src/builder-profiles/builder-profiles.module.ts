import { Module } from '@nestjs/common';
import { BuilderProfilesController } from './builder-profiles.controller';
import { BuilderProfilesService } from './builder-profiles.service';

@Module({
  controllers: [BuilderProfilesController],
  providers: [BuilderProfilesService],
  exports: [BuilderProfilesService],
})
export class BuilderProfilesModule {}
