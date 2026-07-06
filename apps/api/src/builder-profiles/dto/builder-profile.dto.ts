import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBuilderProfileDto {
  @IsString()
  @MaxLength(200)
  companyName!: string;

  @IsArray()
  @IsString({ each: true })
  serviceCities!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioImages?: string[];
}

export class UpdateBuilderProfileDto extends PartialType(CreateBuilderProfileDto) {}
