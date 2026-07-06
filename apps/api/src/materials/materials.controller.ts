import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MaterialsService } from './materials.service';
import { User } from '@prisma/client';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materials: MaterialsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
  ) {
    return this.materials.findAll(search, category, subcategory);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materials.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: CreateMaterialDto) {
    return this.materials.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateMaterialDto) {
    return this.materials.update(id, user.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.materials.remove(id, user.id);
  }
}
