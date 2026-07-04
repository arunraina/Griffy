import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LabourTrade } from '../labour.entity';

export class CreateLabourDto {
  @ApiProperty({ enum: LabourTrade })
  @IsEnum(LabourTrade)
  trade: LabourTrade;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  experienceYears: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weeklyRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  languages?: string[];

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
