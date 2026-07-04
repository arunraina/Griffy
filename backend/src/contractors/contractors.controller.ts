import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContractorsService } from './contractors.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContractorSpecialty } from './contractor.entity';

@ApiTags('contractors')
@Controller('contractors')
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Get()
  @ApiQuery({ name: 'specialty', required: false, enum: ContractorSpecialty })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'available', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('specialty') specialty: ContractorSpecialty,
    @Query('city') city: string,
    @Query('search') search: string,
    @Query('available') available: boolean,
    @Query('sortBy') sortBy: string,
  ) {
    return this.contractorsService.findAll({ page, limit, specialty, city, search, available, sortBy });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyProfile(@Request() req: any) {
    return this.contractorsService.findByUserId(req.user.id);
  }

  @Patch('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateMyProfile(@Body() updates: Partial<CreateContractorDto>, @Request() req: any) {
    const profile = await this.contractorsService.findByUserId(req.user.id);
    if (!profile) throw new NotFoundException('Contractor profile not found');
    return this.contractorsService.update(profile.id, updates);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractorsService.findById(id, true);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateContractorDto, @Request() req: any) {
    return this.contractorsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updates: Partial<CreateContractorDto>) {
    return this.contractorsService.update(id, updates);
  }
}
