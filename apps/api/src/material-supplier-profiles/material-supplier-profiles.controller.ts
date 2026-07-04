import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MaterialSupplierProfilesService } from './material-supplier-profiles.service';
import { User } from '@prisma/client';

@Controller('material-supplier-profiles')
export class MaterialSupplierProfilesController {
  constructor(private readonly service: MaterialSupplierProfilesService) {}

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
      businessName: string;
      businessAddress: string;
      deliveryCities: string[];
      gstNumber?: string;
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
      businessName?: string;
      businessAddress?: string;
      deliveryCities?: string[];
      gstNumber?: string;
    },
  ) {
    return this.service.update(id, user.id, body);
  }
}
