import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProjectsService } from './projects.service';
import { User } from '@prisma/client';
import { CreateProjectDto, SubmitBidDto, UpdateBidStatusDto } from './dto/project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findOpen(@Query('projectType') projectType?: string) {
    return this.projects.findOpen(projectType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projects.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: CreateProjectDto) {
    return this.projects.create(user.id, body);
  }

  @Get(':id/bids')
  @UseGuards(AuthGuard)
  findBids(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projects.findBids(id, user.id);
  }

  @Post(':id/bids')
  @UseGuards(AuthGuard)
  submitBid(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: SubmitBidDto,
  ) {
    return this.projects.submitBid(id, user.id, body);
  }

  @Patch(':id/bids/:bidId')
  @UseGuards(AuthGuard)
  updateBidStatus(
    @Param('id') id: string,
    @Param('bidId') bidId: string,
    @CurrentUser() user: User,
    @Body() body: UpdateBidStatusDto,
  ) {
    return this.projects.updateBidStatus(id, bidId, user.id, body.status);
  }
}
