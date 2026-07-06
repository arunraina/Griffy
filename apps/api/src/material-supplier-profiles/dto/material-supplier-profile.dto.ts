import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMaterialSupplierProfileDto {
  @IsString()
  @MaxLength(200)
  businessName!: string;

  @IsString()
  @MaxLength(500)
  businessAddress!: string;

  @IsArray()
  @IsString({ each: true })
  deliveryCities!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(30)
  gstNumber?: string;
}

export class UpdateMaterialSupplierProfileDto extends PartialType(CreateMaterialSupplierProfileDto) {}
