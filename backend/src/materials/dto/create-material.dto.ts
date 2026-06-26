import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaterialCategory } from '../material.entity';

export class CreateMaterialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: MaterialCategory })
  @IsEnum(MaterialCategory)
  category: MaterialCategory;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  pricePerUnit: number;

  @ApiProperty({ example: 'per ton' })
  @IsString()
  unit: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minOrderQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deliveryDays?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;
}
