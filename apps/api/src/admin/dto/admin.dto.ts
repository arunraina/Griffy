import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
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
