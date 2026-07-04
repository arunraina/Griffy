import {
  Body, Controller, Get, Param, Patch, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  listUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return this.adminService.listUsers(page, limit, search);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean; role?: string },
  ) {
    return this.adminService.updateUser(id, body);
  }

  @Get('contractors')
  listContractors(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('verified') verified: string,
  ) {
    const v = verified === 'true' ? true : verified === 'false' ? false : undefined;
    return this.adminService.listContractors(page, limit, v);
  }

  @Patch('contractors/:id/verify')
  verifyContractor(@Param('id') id: string) {
    return this.adminService.verifyContractor(id);
  }

  @Get('materials')
  listMaterials(@Query('page') page: number, @Query('limit') limit: number) {
    return this.adminService.listMaterials(page, limit);
  }

  @Patch('materials/:id/feature')
  toggleFeatured(@Param('id') id: string) {
    return this.adminService.toggleFeatured(id);
  }

  @Get('orders')
  listOrders(@Query('page') page: number, @Query('limit') limit: number) {
    return this.adminService.listOrders(page, limit);
  }
}
