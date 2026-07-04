import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PropertySellerProfilesService } from './property-seller-profiles.service';
import { User } from '@prisma/client';

@Controller('property-seller-profiles')
export class PropertySellerProfilesController {
  constructor(private readonly service: PropertySellerProfilesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
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
  create(@CurrentUser() user: User, @Body() body: { bio?: string }) {
    return this.service.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: { bio?: string }) {
    return this.service.update(id, user.id, body);
  }
}
