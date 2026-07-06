import { Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService, RazorpayWebhookPayload } from './payments.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('razorpay')
  @HttpCode(200)
  handleRazorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
    @Headers('x-razorpay-event-id') eventId: string | undefined,
  ) {
    return this.payments.handleWebhook(req.rawBody as Buffer, signature, eventId, req.body as RazorpayWebhookPayload);
  }
}
