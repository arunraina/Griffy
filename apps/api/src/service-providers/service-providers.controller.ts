import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ServiceProvidersService } from './service-providers.service';
import { User } from '@prisma/client';

@Controller('service-providers')
export class ServiceProvidersController {
  constructor(private readonly serviceProviders: ServiceProvidersService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.serviceProviders.findAll({ category, location });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceProviders.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: User,
    @Body() body: { category: string; description?: string; location: string },
  ) {
    return this.serviceProviders.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() body: { category?: string; description?: string; location?: string },
  ) {
    return this.serviceProviders.update(id, body);
  }
}
