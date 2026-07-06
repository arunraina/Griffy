import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min, MaxLength } from 'class-validator';
import { ReviewTargetType } from '@prisma/client';

export class CreateReviewDto {
  @IsEnum(ReviewTargetType)
  targetType!: ReviewTargetType;

  @IsUUID()
  targetId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
