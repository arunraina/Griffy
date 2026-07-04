import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @Min(0)
  bidAmount: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
