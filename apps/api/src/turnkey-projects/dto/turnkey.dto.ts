import {
  IsArray, IsEnum, IsInt, IsISO8601, IsNumber, IsOptional, IsPositive,
  IsString, IsUUID, Max, MaxLength, Min,
} from 'class-validator';
import { TurnkeyProjectType } from '@prisma/client';

export class CreateTurnkeyProjectDto {
  @IsUUID()
  providerId!: string;

  @IsEnum(TurnkeyProjectType)
  type!: TurnkeyProjectType;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(3000)
  description!: string;

  @IsNumber()
  @IsPositive()
  budget!: number;

  @IsOptional()
  @IsISO8601()
  targetEndDate?: string;
}

export class PostProjectUpdateDto {
  @IsString()
  @MaxLength(2000)
  note!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  percentComplete!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class ProposeMilestoneDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsInt()
  @Min(1)
  sequence!: number;
}

export class RequestMilestoneChangesDto {
  @IsString()
  @MaxLength(1000)
  note!: string;
}
