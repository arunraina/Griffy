import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';
import { Prisma, RefundStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { BookingsService } from '../bookings/bookings.service';
import { NotificationsService } from '../notifications/notifications.service';

export type PaymentEntityType = 'order' | 'booking';

// Covers both payment.* and refund.* webhook shapes (refund.* handling
// lands in Phase 4 Part B, once the Refund model exists) so this interface
// doesn't need another rewrite then.
export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        notes?: { entityType?: string; entityId?: string };
      };
    };
    refund?: {
      entity: {
        id: string;
        payment_id: string;
        status: string;
      };
    };
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private _razorpay: Razorpay | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
    private readonly bookings: BookingsService,
    private readonly notifications: NotificationsService,
  ) {}

  private get razorpay(): Razorpay {
    if (!this._razorpay) {
      this._razorpay = new Razorpay({
        key_id: this.config.getOrThrow('RAZORPAY_KEY_ID'),
        key_secret: this.config.getOrThrow('RAZORPAY_KEY_SECRET'),
      });
    }
    return this._razorpay;
  }

  async createOrder(entityType: PaymentEntityType, entityId: string, amountInPaise: number) {
    const razorpayOrder = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `${entityType}_${entityId}`,
      notes: { entityType, entityId },
    });

    if (entityType === 'order') {
      await this.prisma.order.update({ where: { id: entityId }, data: { razorpayOrderId: razorpayOrder.id } });
      await this.orders.updateStatus(entityId, 'PLACED');
    } else {
      await this.prisma.booking.update({ where: { id: entityId }, data: { razorpayOrderId: razorpayOrder.id } });
      await this.bookings.updateStatus(entityId, 'PENDING');
    }

    return { razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency };
  }

  verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = createHmac('sha256', this.config.getOrThrow('RAZORPAY_KEY_SECRET'))
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  // The frontend's post-payment callback and the webhook race each other —
  // whichever arrives first marks the entity paid; the second is a no-op
  // (markPaid/markPaymentFailed on Orders/Bookings are themselves
  // idempotent). Resolves the entity by razorpayOrderId server-side rather
  // than trusting an entityId/entityType from the client.
  async verifyAndMarkPaid(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    const isValid = this.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
    if (!isValid) return { success: false };

    const order = await this.prisma.order.findFirst({ where: { razorpayOrderId } });
    if (order) {
      await this.orders.markPaid(order.id, razorpayPaymentId);
      return { success: true };
    }

    const booking = await this.prisma.booking.findFirst({ where: { razorpayOrderId } });
    if (booking) {
      await this.bookings.markPaid(booking.id, razorpayPaymentId);
      return { success: true };
    }

    this.logger.warn(`[payments] verify: no order/booking found for razorpayOrderId ${razorpayOrderId}`);
    return { success: true };
  }

  // rawBody is the exact bytes Razorpay signed — HMAC must run against
  // that, not a re-serialized copy of the parsed JSON (which can produce a
  // different byte sequence and silently fail signature checks, or worse,
  // silently succeed on a re-serialization that happens to match).
  async handleWebhook(rawBody: Buffer, signature: string, eventId: string | undefined, payload: RazorpayWebhookPayload) {
    const webhookSecret = this.config.getOrThrow('RAZORPAY_WEBHOOK_SECRET');
    const expectedSignature = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (eventId) {
      const existing = await this.prisma.paymentEvent.findUnique({ where: { razorpayEventId: eventId } });
      if (existing?.processedAt) {
        return { received: true };
      }

      const paymentEntity = payload.payload.payment?.entity;
      const refundEntity = payload.payload.refund?.entity;

      await this.prisma.paymentEvent.upsert({
        where: { razorpayEventId: eventId },
        create: {
          razorpayEventId: eventId,
          eventType: payload.event,
          razorpayOrderId: paymentEntity?.order_id ?? 'unknown',
          razorpayPaymentId: paymentEntity?.id ?? refundEntity?.payment_id,
          payloadJson: payload as unknown as Prisma.InputJsonValue,
        },
        update: {},
      });
    } else {
      this.logger.warn(`[webhook] Missing X-Razorpay-Event-Id header for event "${payload.event}" — processing without idempotency guard`);
    }

    await this.processWebhookEvent(payload);

    if (eventId) {
      await this.prisma.paymentEvent.update({ where: { razorpayEventId: eventId }, data: { processedAt: new Date() } });
    }

    return { received: true };
  }

  private async processWebhookEvent(payload: RazorpayWebhookPayload): Promise<void> {
    const { event } = payload;
    const paymentEntity = payload.payload.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const { entityType, entityId } = paymentEntity.notes ?? {};
      if (entityType === 'order' && entityId) await this.orders.markPaid(entityId, paymentEntity.id);
      else if (entityType === 'booking' && entityId) await this.bookings.markPaid(entityId, paymentEntity.id);
      return;
    }

    if (event === 'payment.failed' && paymentEntity) {
      const { entityType, entityId } = paymentEntity.notes ?? {};
      if (entityType === 'order' && entityId) await this.orders.markPaymentFailed(entityId);
      else if (entityType === 'booking' && entityId) await this.bookings.markPaymentFailed(entityId);
      return;
    }

    if (event === 'refund.processed' || event === 'refund.failed') {
      await this.handleRefundWebhook(payload);
      return;
    }
  }

  // Admin-initiated refund. Amount defaults to the full remaining
  // refundable balance (paid amount minus any prior non-FAILED refunds),
  // and supports partial/multiple refunds against the same order.
  async createRefund(adminId: string, orderId: string, amount: number | undefined, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { refunds: true } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUND_INITIATED') {
      throw new BadRequestException('This order has not been paid — nothing to refund.');
    }
    if (!order.razorpayPaymentId) {
      throw new BadRequestException('This order has no payment on record.');
    }

    const paidAmountPaise = Math.round(Number(order.totalAmount) * 100);
    const alreadyRefunded = order.refunds
      .filter((r) => r.status !== RefundStatus.FAILED)
      .reduce((sum, r) => sum + r.amount, 0);
    const remaining = paidAmountPaise - alreadyRefunded;

    if (remaining <= 0) throw new BadRequestException('This order has already been fully refunded.');

    const refundAmount = amount ?? remaining;
    if (refundAmount > remaining) {
      throw new BadRequestException(`Refund amount exceeds the remaining refundable balance of ${remaining} paise.`);
    }

    const razorpayRefund = await this.razorpay.payments.refund(order.razorpayPaymentId, {
      amount: refundAmount,
      notes: { orderId, reason },
    });

    const isProcessed = razorpayRefund.status === 'processed';
    const refund = await this.prisma.refund.create({
      data: {
        orderId,
        razorpayRefundId: razorpayRefund.id,
        amount: refundAmount,
        reason,
        status: isProcessed ? RefundStatus.PROCESSED : RefundStatus.INITIATED,
        initiatedById: adminId,
        processedAt: isProcessed ? new Date() : null,
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: isProcessed ? 'REFUNDED' : 'REFUND_INITIATED' },
    });

    if (isProcessed) {
      await this.notifications.notify(order.buyerId, 'order.refunded', {
        orderId,
        amountRupees: (refundAmount / 100).toFixed(2),
      });
    }

    return refund;
  }

  listRefunds(status?: RefundStatus) {
    return this.prisma.refund.findMany({
      where: status ? { status } : {},
      include: { order: { select: { id: true, buyerId: true, totalAmount: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async handleRefundWebhook(payload: RazorpayWebhookPayload): Promise<void> {
    const refundEntity = payload.payload.refund?.entity;
    if (!refundEntity) return;

    const existing = await this.prisma.refund.findFirst({ where: { razorpayRefundId: refundEntity.id } });
    if (!existing) {
      this.logger.warn(`[refunds:alert] Received ${payload.event} for unknown razorpayRefundId ${refundEntity.id}`);
      return;
    }

    const status = refundEntity.status === 'processed' ? RefundStatus.PROCESSED : RefundStatus.FAILED;
    if (existing.status === status) return; // already applied

    await this.prisma.refund.update({
      where: { id: existing.id },
      data: { status, processedAt: status === RefundStatus.PROCESSED ? new Date() : existing.processedAt },
    });

    if (status === RefundStatus.FAILED) {
      this.logger.error(`[refunds:alert] Refund ${existing.id} (order ${existing.orderId}) failed at Razorpay — needs manual follow-up.`);
      return;
    }

    const order = await this.prisma.order.update({
      where: { id: existing.orderId },
      data: { paymentStatus: 'REFUNDED' },
    });
    await this.notifications.notify(order.buyerId, 'order.refunded', {
      orderId: order.id,
      amountRupees: (existing.amount / 100).toFixed(2),
    });
  }
}
