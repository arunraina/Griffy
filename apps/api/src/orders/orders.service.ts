import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

const STATUS_MESSAGE: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: 'Your order has been confirmed.',
  SHIPPED: 'Your order has shipped.',
  DELIVERED: 'Your order has been delivered.',
  CANCELLED: 'Your order has been cancelled.',
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { items: { include: { material: { select: { name: true, imageUrls: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { material: true } }, buyer: { select: { name: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(
    buyerId: string,
    data: { items: { materialId: string; quantity: number }[]; shippingAddress: string; notes?: string },
  ) {
    if (!data.items?.length) throw new NotFoundException('Order must contain at least one item');

    const materials = await this.prisma.material.findMany({
      where: { id: { in: data.items.map((i) => i.materialId) } },
    });
    const materialById = new Map(materials.map((m) => [m.id, m]));

    const lineItems = data.items.map((i) => {
      const material = materialById.get(i.materialId);
      if (!material) throw new NotFoundException(`Material ${i.materialId} not found`);
      const unitPrice = material.price;
      const lineTotal = Number(unitPrice) * i.quantity;
      return { materialId: i.materialId, quantity: i.quantity, unitPrice, lineTotal };
    });

    const totalAmount = lineItems.reduce((sum, i) => sum + Number(i.lineTotal), 0);

    return this.prisma.order.create({
      data: {
        buyerId,
        totalAmount,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        items: { create: lineItems },
      },
      include: { items: { include: { material: { select: { name: true, imageUrls: true } } } } },
    });
  }

  async updateStatus(id: string, status: OrderStatus, razorpayPaymentId?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status, ...(razorpayPaymentId && { razorpayPaymentId }) },
    });

    const message = STATUS_MESSAGE[status];
    if (message) {
      await this.notifications.create(order.buyerId, 'ORDER_STATUS_CHANGED', 'Order update', message, `/orders/${order.id}`);
    }

    return order;
  }
}
