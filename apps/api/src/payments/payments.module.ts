import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { WebhooksController } from './webhooks.controller';
import { PaymentsService } from './payments.service';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [AuthModule, OrdersModule, BookingsModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
