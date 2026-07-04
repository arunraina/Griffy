import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ContractorProfilesService } from './contractor-profiles.service';
import { User } from '@prisma/client';

@Controller('contractor-profiles')
export class ContractorProfilesController {
  constructor(private readonly service: ContractorProfilesService) {}

  @Get()
  findAll(@Query('city') city?: string) {
    return this.service.findAll(city);
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
      contractorType: string;
      tradeSkills: string[];
      experience: string;
      serviceCities: string[];
      licenseNumber?: string;
      dailyRate?: number;
      projectRate?: number;
      availability?: boolean;
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
      contractorType?: string;
      tradeSkills?: string[];
      experience?: string;
      serviceCities?: string[];
      licenseNumber?: string;
      dailyRate?: number;
      projectRate?: number;
      availability?: boolean;
      bio?: string;
      portfolioImages?: string[];
    },
  ) {
    return this.service.update(id, user.id, body);
  }
}
