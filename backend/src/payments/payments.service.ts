import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay');
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly razorpay: any;
  private readonly keySecret: string;

  constructor(private readonly config: ConfigService) {
    const keyId = config.getOrThrow<string>('RAZORPAY_KEY_ID');
    this.keySecret = config.getOrThrow<string>('RAZORPAY_KEY_SECRET');
    this.razorpay = new Razorpay({ key_id: keyId, key_secret: this.keySecret });
  }

  async createOrder(dto: CreatePaymentOrderDto) {
    const amountInPaise = Math.round(dto.amount * 100);
    try {
      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: dto.currency ?? 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: dto.notes ? { notes: dto.notes } : undefined,
      });
      return {
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: this.config.get<string>('RAZORPAY_KEY_ID'),
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to create Razorpay order');
    }
  }

  verifyPayment(dto: VerifyPaymentDto): { success: boolean } {
    const body = `${dto.razorpay_order_id}|${dto.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }
    return { success: true };
  }
}
