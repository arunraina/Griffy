import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PropertyAgentProfilesService } from './property-agent-profiles.service';
import { User } from '@prisma/client';
import { CreatePropertyAgentProfileDto, UpdatePropertyAgentProfileDto } from './dto/property-agent-profile.dto';

@Controller('property-agent-profiles')
export class PropertyAgentProfilesController {
  constructor(private readonly service: PropertyAgentProfilesService) {}

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
  create(@CurrentUser() user: User, @Body() body: CreatePropertyAgentProfileDto) {
    return this.service.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdatePropertyAgentProfileDto,
  ) {
    return this.service.update(id, user.id, body);
  }
}
