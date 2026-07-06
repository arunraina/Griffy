import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePropertySellerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;
}

export class UpdatePropertySellerProfileDto extends PartialType(CreatePropertySellerProfileDto) {}
