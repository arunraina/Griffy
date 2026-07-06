import { IsEnum, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';
import { BidStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @MaxLength(100)
  projectType!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(3000)
  description!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsString()
  @MaxLength(100)
  state!: string;

  @IsNumber()
  @IsPositive()
  budgetMin!: number;

  @IsNumber()
  @IsPositive()
  budgetMax!: number;

  @IsString()
  @MaxLength(100)
  timeline!: string;
}

export class SubmitBidDto {
  @IsNumber()
  @IsPositive()
  bidAmount!: number;

  @IsString()
  @MaxLength(1000)
  message!: string;
}

export class UpdateBidStatusDto {
  @IsEnum(BidStatus)
  status!: BidStatus;
}
