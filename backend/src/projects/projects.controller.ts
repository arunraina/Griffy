import {
  Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectType } from './project.entity';
import { BidStatus } from './bid.entity';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'projectType', required: false, enum: ProjectType })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('projectType') projectType: ProjectType,
    @Query('city') city: string,
    @Query('search') search: string,
  ) {
    return this.projectsService.findAll({ page, limit, projectType, city, search });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyProjects(
    @Request() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.projectsService.findByHomeowner(req.user.id, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  close(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.close(id, req.user.id);
  }

  @Post(':id/bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createBid(@Param('id') projectId: string, @Body() dto: CreateBidDto, @Request() req: any) {
    return this.projectsService.createBid(projectId, dto, req.user.id);
  }

  @Get(':id/bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getBids(@Param('id') projectId: string, @Request() req: any) {
    return this.projectsService.findBids(projectId, req.user.id);
  }

  @Patch(':id/bids/:bidId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateBidStatus(
    @Param('id') projectId: string,
    @Param('bidId') bidId: string,
    @Body('status') status: BidStatus,
    @Request() req: any,
  ) {
    return this.projectsService.updateBidStatus(projectId, bidId, status, req.user.id);
  }
}
