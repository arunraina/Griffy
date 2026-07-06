import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { LandsService } from './lands.service';
import { LandType, User } from '@prisma/client';
import { CreateLandDto, UpdateLandDto } from './dto/land.dto';

@Controller('lands')
export class LandsController {
  constructor(private readonly lands: LandsService) {}

  @Get()
  findAll(@Query('city') city?: string, @Query('landType') landType?: LandType) {
    return this.lands.findAll(city, landType);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(@CurrentUser() user: User) {
    return this.lands.findByOwner(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lands.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: CreateLandDto) {
    return this.lands.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateLandDto) {
    return this.lands.update(id, user.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.lands.remove(id, user.id);
  }
}
