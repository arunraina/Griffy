import { Body, Controller, Get, Header, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { LabourProfilesService } from './labour-profiles.service';
import { User } from '@prisma/client';
import { CreateLabourProfileDto, UpdateLabourProfileDto } from './dto/labour-profile.dto';

@Controller('labour-profiles')
export class LabourProfilesController {
  constructor(private readonly service: LabourProfilesService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
  findAll(@Query('city') city?: string) {
    return this.service.findAll(city);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  findMine(@CurrentUser() user: User) {
    return this.service.findByUser(user.id);
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: CreateLabourProfileDto) {
    return this.service.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateLabourProfileDto,
  ) {
    return this.service.update(id, user.id, body);
  }
}
