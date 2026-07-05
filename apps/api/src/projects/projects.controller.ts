import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProjectsService } from './projects.service';
import { BidStatus, User } from '@prisma/client';

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
  create(
    @CurrentUser() user: User,
    @Body()
    body: {
      projectType: string;
      title: string;
      description: string;
      city: string;
      state: string;
      budgetMin: number;
      budgetMax: number;
      timeline: string;
    },
  ) {
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
    @Body() body: { bidAmount: number; message: string },
  ) {
    return this.projects.submitBid(id, user.id, body);
  }

  @Patch(':id/bids/:bidId')
  @UseGuards(AuthGuard)
  updateBidStatus(
    @Param('id') id: string,
    @Param('bidId') bidId: string,
    @CurrentUser() user: User,
    @Body() body: { status: BidStatus },
  ) {
    return this.projects.updateBidStatus(id, bidId, user.id, body.status);
  }
}
