import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { ServiceItemsService } from './service-items.service';
import { CreateServiceItemDto, UpdateServiceItemDto } from './dto/service-item.dto';

@Controller('service-items')
export class ServiceItemsController {
  constructor(private readonly serviceItems: ServiceItemsService) {}

  @Get(':profileType/:profileId')
  list(@Param('profileType') profileType: string, @Param('profileId') profileId: string) {
    return this.serviceItems.list(profileType, profileId);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: CreateServiceItemDto) {
    return this.serviceItems.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateServiceItemDto) {
    return this.serviceItems.update(user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.serviceItems.remove(user.id, id);
  }
}
