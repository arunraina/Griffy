import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MaxLength } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @MaxLength(100)
  category!: string;

  @IsString()
  @MaxLength(100)
  subcategory!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roomTypes?: string[];

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsString()
  @MaxLength(50)
  unit!: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}
