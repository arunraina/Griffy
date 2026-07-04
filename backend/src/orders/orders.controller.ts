import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderStatus } from './order.entity';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(dto, req.user.id);
  }

  @Get('my')
  myOrders(@Request() req: any, @Query('page') page: number, @Query('limit') limit: number) {
    return this.ordersService.findForUser(req.user.id, page, limit);
  }

  @Get('incoming')
  incomingOrders(@Request() req: any, @Query('page') page: number, @Query('limit') limit: number) {
    return this.ordersService.findIncomingForUser(req.user.id, req.user.role, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/release-escrow')
  releaseEscrow(@Param('id') id: string) {
    return this.ordersService.releaseEscrow(id);
  }
}
