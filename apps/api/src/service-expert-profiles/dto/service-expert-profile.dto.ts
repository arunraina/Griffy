import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateServiceExpertProfileDto {
  @IsString()
  @MaxLength(100)
  expertiseType!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[];

  @IsString()
  @MaxLength(100)
  experience!: string;

  @IsArray()
  @IsString({ each: true })
  serviceCities!: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioImages?: string[];
}

export class UpdateServiceExpertProfileDto extends PartialType(CreateServiceExpertProfileDto) {}
