import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrdersService } from './orders.service';
import { OrderStatus, User } from '@prisma/client';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findMy(@CurrentUser() user: User) {
    return this.orders.findByBuyer(user.id);
  }

  @Get('incoming')
  findIncoming(@CurrentUser() user: User) {
    return this.orders.findIncoming(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.orders.getStatusHistory(id);
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() body: { items: { materialId: string; quantity: number }[]; shippingAddress: string; notes?: string },
  ) {
    return this.orders.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; note?: string },
  ) {
    return this.orders.updateStatusForSupplier(id, user.id, body.status, body.note);
  }
}
