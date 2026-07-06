import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PaymentsService } from './payments.service';
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
    return this.payments.verifyAndMarkPaid(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.signature,
    );
  }
}
