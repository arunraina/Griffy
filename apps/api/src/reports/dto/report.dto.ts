import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ReviewTargetType, ReportStatus } from '@prisma/client';

export class CreateReportDto {
  @IsEnum(ReviewTargetType)
  targetType!: ReviewTargetType;

  @IsUUID()
  targetId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  reason!: string;
}

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  status!: ReportStatus;
}
