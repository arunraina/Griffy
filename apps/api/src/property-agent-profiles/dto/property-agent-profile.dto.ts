import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePropertyAgentProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  agencyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceCities?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;
}

export class UpdatePropertyAgentProfileDto extends PartialType(CreatePropertyAgentProfileDto) {}
