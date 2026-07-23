import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { ProfileLookupService } from './profile-lookup.service';

@Controller('profile-lookup')
export class ProfileLookupController {
  constructor(private readonly lookup: ProfileLookupService) {}

  @Get(':userId')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
  async resolve(@Param('userId') userId: string) {
    const result = await this.lookup.resolve(userId);
    if (!result) throw new NotFoundException('No public profile found for this user');
    return result;
  }
}
