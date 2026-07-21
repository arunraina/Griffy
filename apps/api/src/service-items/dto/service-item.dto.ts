import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { PriceUnit } from '@prisma/client';

export type ServiceItemProfileType = 'service-expert' | 'labour';

export class CreateServiceItemDto {
  @IsIn(['service-expert', 'labour'])
  profileType!: ServiceItemProfileType;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @IsPositive()
  price!: number;

  @IsEnum(PriceUnit)
  priceUnit!: PriceUnit;

  @IsString()
  @MaxLength(100)
  category!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateServiceItemDto extends PartialType(OmitType(CreateServiceItemDto, ['profileType'] as const)) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
