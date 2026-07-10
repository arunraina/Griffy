import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrdersService } from './orders.service';
import { User } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

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

  @Get(':id/invoice')
  async getInvoice(@CurrentUser() user: User, @Param('id') id: string, @Res() res: Response) {
    const result = await this.orders.getInvoicePdf(id, user.id, user.role);
    if (!result) throw new NotFoundException('Invoice not available for this order yet.');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${result.invoiceNumber.replace(/\//g, '_')}.pdf"`);
    res.send(result.buffer);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateOrderDto) {
    return this.orders.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.orders.updateStatusForSupplier(id, user.id, body.status, body.note);
  }
}
