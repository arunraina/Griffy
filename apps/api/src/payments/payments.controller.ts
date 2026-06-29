import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { PaymentsService, PaymentEntityType, RazorpayWebhookPayload } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('create-order')
  @UseGuards(AuthGuard)
  createOrder(@Body() body: { entityType: PaymentEntityType; entityId: string; amountInPaise: number }) {
    return this.payments.createOrder(body.entityType, body.entityId, body.amountInPaise);
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  verify(@Body() body: { razorpayOrderId: string; razorpayPaymentId: string; signature: string }) {
    const isValid = this.payments.verifySignature(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.signature,
    );
    return { success: isValid };
  }

  @Post('webhook')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: RazorpayWebhookPayload,
  ) {
    return this.payments.handleWebhook(body, signature);
  }
}
