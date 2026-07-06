import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { LandType } from '@prisma/client';

export class CreateLandDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(LandType)
  landType!: LandType;

  @IsNumber()
  @IsPositive()
  areaSqFt!: number;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsString()
  @MaxLength(300)
  location!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsString()
  @MaxLength(100)
  state!: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class UpdateLandDto extends PartialType(CreateLandDto) {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
