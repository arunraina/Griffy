import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { material: { select: { name: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { material: true, buyer: { select: { name: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(buyerId: string, data: { materialId: string; quantity: number; shippingAddress: string; notes?: string }) {
    const material = await this.prisma.material.findUniqueOrThrow({ where: { id: data.materialId } });
    const totalAmount = Number(material.price) * data.quantity;
    return this.prisma.order.create({
      data: {
        buyerId,
        materialId: data.materialId,
        quantity: data.quantity,
        unitPrice: material.price,
        totalAmount,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
      },
    });
  }

  updateStatus(id: string, status: OrderStatus, razorpayPaymentId?: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status, ...(razorpayPaymentId && { razorpayPaymentId }) },
    });
  }
}
