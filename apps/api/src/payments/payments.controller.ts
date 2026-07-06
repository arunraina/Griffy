import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { PaymentsService, RazorpayWebhookPayload } from './payments.service';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('create-order')
  @UseGuards(AuthGuard)
  createOrder(@Body() body: CreatePaymentOrderDto) {
    return this.payments.createOrder(body.entityType, body.entityId, body.amountInPaise);
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  verify(@Body() body: VerifyPaymentDto) {
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
