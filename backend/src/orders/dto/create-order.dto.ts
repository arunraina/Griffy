import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '../order.entity';

export class CreateOrderDto {
  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}
