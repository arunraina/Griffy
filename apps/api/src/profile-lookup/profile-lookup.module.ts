import { Module } from '@nestjs/common';
import { ProfileLookupController } from './profile-lookup.controller';
import { ProfileLookupService } from './profile-lookup.service';

@Module({
  controllers: [ProfileLookupController],
  providers: [ProfileLookupService],
})
export class ProfileLookupModule {}
