import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';
import { OrdersService } from '../orders/orders.service';
import { BookingsService } from '../bookings/bookings.service';

export type PaymentEntityType = 'order' | 'booking';

export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        notes: { entityType: string; entityId: string };
      };
    };
  };
}

@Injectable()
export class PaymentsService {
  private _razorpay: Razorpay | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly orders: OrdersService,
    private readonly bookings: BookingsService,
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
    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `${entityType}_${entityId}`,
      notes: { entityType, entityId },
    });

    if (entityType === 'order') {
      await this.orders.updateStatus(entityId, 'PENDING');
    } else {
      await this.bookings.updateStatus(entityId, 'PENDING');
    }

    return { razorpayOrderId: order.id, amount: order.amount, currency: order.currency };
  }

  verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = createHmac('sha256', this.config.getOrThrow('RAZORPAY_KEY_SECRET'))
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  async handleWebhook(payload: RazorpayWebhookPayload, signature: string) {
    const webhookSecret = this.config.getOrThrow('RAZORPAY_WEBHOOK_SECRET');
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const { event, payload: { payment } } = payload;
    if (event === 'payment.captured') {
      const { notes, id: paymentId } = payment.entity;
      const { entityType, entityId } = notes;

      if (entityType === 'order') {
        await this.orders.updateStatus(entityId, 'CONFIRMED', paymentId);
      } else if (entityType === 'booking') {
        await this.bookings.updateStatus(entityId, 'CONFIRMED', paymentId);
      }
    }
  }
}
