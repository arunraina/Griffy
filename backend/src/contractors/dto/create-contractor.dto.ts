import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractorSpecialty } from '../contractor.entity';

export class CreateContractorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ enum: ContractorSpecialty })
  @IsEnum(ContractorSpecialty)
  specialty: ContractorSpecialty;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  experienceYears: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  priceRangeMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  priceRangeMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
