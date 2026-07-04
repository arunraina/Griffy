import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PropertiesService } from './properties.service';
import { FurnishingStatus, PropertyType, User } from '@prisma/client';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @Get()
  findAll(@Query('city') city?: string, @Query('propertyType') propertyType?: PropertyType) {
    return this.properties.findAll(city, propertyType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.properties.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: User,
    @Body()
    body: {
      title: string;
      description?: string;
      propertyType: PropertyType;
      furnishing: FurnishingStatus;
      areaSqFt: number;
      price: number;
      bedrooms?: number;
      bathrooms?: number;
      location: string;
      city: string;
      state: string;
      latitude?: number;
      longitude?: number;
      imageUrls?: string[];
    },
  ) {
    return this.properties.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      propertyType?: PropertyType;
      furnishing?: FurnishingStatus;
      areaSqFt?: number;
      price?: number;
      bedrooms?: number;
      bathrooms?: number;
      location?: string;
      city?: string;
      state?: string;
      latitude?: number;
      longitude?: number;
      imageUrls?: string[];
      isAvailable?: boolean;
    },
  ) {
    return this.properties.update(id, user.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.properties.remove(id, user.id);
  }
}
