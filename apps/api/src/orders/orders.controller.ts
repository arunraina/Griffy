import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrdersService } from './orders.service';
import { User } from '@prisma/client';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findMy(@CurrentUser() user: User) {
    return this.orders.findByBuyer(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() body: { materialId: string; quantity: number; shippingAddress: string; notes?: string },
  ) {
    return this.orders.create(user.id, body);
  }
}
