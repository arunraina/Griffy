import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ServiceExpertProfilesService } from './service-expert-profiles.service';
import { User } from '@prisma/client';

@Controller('service-expert-profiles')
export class ServiceExpertProfilesController {
  constructor(private readonly service: ServiceExpertProfilesService) {}

  @Get()
  findAll(@Query('city') city?: string, @Query('expertiseType') expertiseType?: string) {
    return this.service.findAll(city, expertiseType);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  findMine(@CurrentUser() user: User) {
    return this.service.findByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: User,
    @Body()
    body: {
      expertiseType: string;
      qualifications?: string[];
      experience: string;
      serviceCities: string[];
      consultationFee?: number;
      isAvailable?: boolean;
      bio?: string;
      portfolioImages?: string[];
    },
  ) {
    return this.service.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body()
    body: {
      expertiseType?: string;
      qualifications?: string[];
      experience?: string;
      serviceCities?: string[];
      consultationFee?: number;
      isAvailable?: boolean;
      bio?: string;
      portfolioImages?: string[];
    },
  ) {
    return this.service.update(id, user.id, body);
  }
}
