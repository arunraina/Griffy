import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class RejectProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ModerateProjectDto {
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}

export class CreateRefundDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  amount?: number; // paise; defaults to full remaining refundable balance

  @IsString()
  @MaxLength(500)
  reason!: string;
}

export class ModerateContentDto {
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @IsBoolean()
  isDemoted?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  moderationNote?: string;
}
