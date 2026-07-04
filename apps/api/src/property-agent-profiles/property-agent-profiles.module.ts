import { Module } from '@nestjs/common';
import { PropertyAgentProfilesController } from './property-agent-profiles.controller';
import { PropertyAgentProfilesService } from './property-agent-profiles.service';

@Module({
  controllers: [PropertyAgentProfilesController],
  providers: [PropertyAgentProfilesService],
  exports: [PropertyAgentProfilesService],
})
export class PropertyAgentProfilesModule {}
