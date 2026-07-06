import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

const STATUS_MESSAGE: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: 'Your order has been accepted.',
  REJECTED: 'Your order was rejected by the seller.',
  PACKED: 'Your order has been packed.',
  SHIPPED: 'Your order has shipped.',
  DELIVERED: 'Your order has been delivered.',
  CANCELLED: 'Your order has been cancelled.',
};

// Legal supplier-driven transitions. Terminal states (REJECTED, DELIVERED,
// CANCELLED) have no further moves from here.
const LEGAL_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PLACED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
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

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        totalAmount,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        items: { create: lineItems },
      },
      include: { items: { include: { material: { select: { name: true, imageUrls: true, supplier: { select: { userId: true } } } } } } },
    });

    const supplierUserIds = Array.from(new Set(order.items.map((i) => i.material.supplier.userId)));
    const itemSummary = order.items.map((i) => i.material.name).join(', ');
    await Promise.all(
      supplierUserIds.map((supplierUserId) => this.notifications.notify(supplierUserId, 'order.placed', { itemSummary })),
    );

    return order;
  }

  async updateStatus(id: string, status: OrderStatus, razorpayPaymentId?: string, note?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status, statusUpdatedAt: new Date(), ...(razorpayPaymentId && { razorpayPaymentId }) },
    });

    await this.prisma.orderStatusEvent.create({ data: { orderId: id, status, note } });

    const message = STATUS_MESSAGE[status];
    if (message) {
      if (status === 'REJECTED') {
        await this.notifications.notify(order.buyerId, 'order.rejected', { orderId: order.id });
      } else {
        await this.notifications.notify(order.buyerId, 'order.status_changed', { orderId: order.id, message });
      }
    }

    if (status === 'DELIVERED') {
      await this.incrementSupplierOrders(order.id);
    }

    return order;
  }

  // Idempotent — called from both the Razorpay webhook and /payments/verify,
  // whichever arrives first wins. paymentStatus is orthogonal to the
  // fulfillment `status` workflow; only auto-advances PLACED -> ACCEPTED
  // (today's existing behavior) and leaves any later status untouched.
  async markPaid(orderId: string, razorpayPaymentId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentStatus === 'PAID') return order;

    await this.prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID' } });

    if (order.status === 'PLACED') {
      return this.updateStatus(orderId, 'ACCEPTED', razorpayPaymentId);
    }
    return this.prisma.order.update({ where: { id: orderId }, data: { razorpayPaymentId } });
  }

  async markPaymentFailed(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentStatus === 'FAILED') return order;

    await this.prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'FAILED' } });
    await this.prisma.orderStatusEvent.create({ data: { orderId, status: order.status, note: 'Payment failed via Razorpay.' } });
    await this.notifications.notify(order.buyerId, 'order.payment_failed', { orderId });
  }

  findIncoming(userId: string) {
    return this.prisma.order.findMany({
      where: { items: { some: { material: { supplier: { userId } } } } },
      include: {
        items: { include: { material: { select: { name: true, imageUrls: true, supplierId: true } } } },
        buyer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatusForSupplier(orderId: string, userId: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { material: { select: { supplier: { select: { userId: true } } } } } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const isSupplierOnOrder = order.items.some((i) => i.material.supplier.userId === userId);
    if (!isSupplierOnOrder) throw new ForbiddenException('You are not a supplier on this order');

    const allowed = LEGAL_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Cannot move an order from ${order.status} to ${status}`);
    }

    return this.updateStatus(orderId, status, undefined, note);
  }

  async getStatusHistory(orderId: string) {
    return this.prisma.orderStatusEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async incrementSupplierOrders(orderId: string) {
    const items = await this.prisma.orderItem.findMany({
      where: { orderId },
      include: { material: { select: { supplierId: true } } },
    });
    const supplierIds = Array.from(new Set(items.map((i) => i.material.supplierId)));
    await Promise.all(
      supplierIds.map((supplierId) =>
        this.prisma.materialSupplierProfile.update({
          where: { id: supplierId },
          data: { totalOrders: { increment: 1 } },
        }),
      ),
    );
  }
}
