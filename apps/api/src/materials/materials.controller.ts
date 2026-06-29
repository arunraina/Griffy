import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MaterialsService } from './materials.service';
import { User } from '@prisma/client';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materials: MaterialsService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.materials.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materials.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: User,
    @Body() body: { name: string; description?: string; price: number; unit: string; stock: number; imageUrl?: string },
  ) {
    return this.materials.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string | null; price?: number; unit?: string; stock?: number; imageUrl?: string | null }) {
    return this.materials.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.materials.remove(id);
  }
}
