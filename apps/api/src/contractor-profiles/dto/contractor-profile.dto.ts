import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateContractorProfileDto {
  @IsString()
  @MaxLength(100)
  contractorType!: string;

  @IsArray()
  @IsString({ each: true })
  tradeSkills!: string[];

  @IsString()
  @MaxLength(100)
  experience!: string;

  @IsArray()
  @IsString({ each: true })
  serviceCities!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  projectRate?: number;

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

export class UpdateContractorProfileDto extends PartialType(CreateContractorProfileDto) {}
