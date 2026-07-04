import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LabourService } from './labour.service';
import { CreateLabourDto } from './dto/create-labour.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LabourTrade } from './labour.entity';

@ApiTags('labour')
@Controller('labour')
export class LabourController {
  constructor(private readonly labourService: LabourService) {}

  @Get()
  @ApiQuery({ name: 'trade', required: false, enum: LabourTrade })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'available', required: false })
  @ApiQuery({ name: 'maxRate', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('trade') trade: LabourTrade,
    @Query('city') city: string,
    @Query('search') search: string,
    @Query('available') available: boolean,
    @Query('maxRate') maxRate: number,
    @Query('sortBy') sortBy: string,
  ) {
    return this.labourService.findAll({ page, limit, trade, city, search, available, maxRate, sortBy });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyProfile(@Request() req: any) {
    return this.labourService.findByUserId(req.user.id);
  }

  @Patch('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateMyProfile(@Body() updates: Partial<CreateLabourDto>, @Request() req: any) {
    const profile = await this.labourService.findByUserId(req.user.id);
    if (!profile) throw new NotFoundException('Labour profile not found');
    return this.labourService.update(profile.id, updates);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labourService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateLabourDto, @Request() req: any) {
    return this.labourService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updates: Partial<CreateLabourDto>) {
    return this.labourService.update(id, updates);
  }
}
