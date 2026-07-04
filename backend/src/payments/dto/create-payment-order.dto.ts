import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsNumber()
  @Min(1)
  amount: number; // in rupees — backend converts to paise

  @IsString()
  @IsOptional()
  currency?: string; // defaults to INR

  @IsString()
  @IsOptional()
  notes?: string;
}
