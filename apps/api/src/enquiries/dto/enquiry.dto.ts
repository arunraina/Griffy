import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { EnquiryTargetType, EnquiryStatus } from '@prisma/client';

export class CreateEnquiryDto {
  @IsEnum(EnquiryTargetType)
  targetType!: EnquiryTargetType;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  landId?: string;

  @IsString()
  @MaxLength(1000)
  message!: string;
}

export class UpdateEnquiryStatusDto {
  @IsEnum(EnquiryStatus)
  status!: EnquiryStatus;
}
