import { IsIn, IsInt, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsIn(['order', 'booking', 'milestone'])
  entityType!: 'order' | 'booking' | 'milestone';

  @IsUUID()
  entityId!: string;

  @IsInt()
  @IsPositive()
  amountInPaise!: number;
}

export class VerifyPaymentDto {
  @IsString()
  razorpayOrderId!: string;

  @IsString()
  razorpayPaymentId!: string;

  @IsString()
  signature!: string;
}
