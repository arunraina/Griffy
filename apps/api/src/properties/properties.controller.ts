import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PropertiesService } from './properties.service';
import { PropertyType, User } from '@prisma/client';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @Get()
  findAll(@Query('city') city?: string, @Query('propertyType') propertyType?: PropertyType) {
    return this.properties.findAll(city, propertyType);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(@CurrentUser() user: User) {
    return this.properties.findBySeller(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.properties.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: CreatePropertyDto) {
    return this.properties.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdatePropertyDto) {
    return this.properties.update(id, user.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.properties.remove(id, user.id);
  }
}
