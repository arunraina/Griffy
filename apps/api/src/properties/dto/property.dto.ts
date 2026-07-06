import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsEnum, IsInt, IsLatitude, IsLongitude, IsNumber, IsOptional, IsPositive, IsString, Min, MaxLength } from 'class-validator';
import { FurnishingStatus, PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @IsEnum(FurnishingStatus)
  furnishing!: FurnishingStatus;

  @IsNumber()
  @IsPositive()
  areaSqFt!: number;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

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

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
