import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, MaxLength, MinLength } from 'class-validator';
import { ReviewTargetType } from '@prisma/client';

export const REVIEW_SOURCES = ['phone_feedback', 'whatsapp_feedback', 'in_person', 'other'] as const;
export type ReviewSource = (typeof REVIEW_SOURCES)[number];

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

// An admin logging feedback a customer gave offline (phone call, WhatsApp,
// in person) on behalf of someone who has no Griffy account -- reviewerName
// stands in for the reviewer relation, which stays null on these rows.
export class AdminCreateReviewDto {
  @IsEnum(ReviewTargetType)
  targetType!: ReviewTargetType;

  @IsUUID()
  targetId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MinLength(20)
  @MaxLength(500)
  comment!: string;

  @IsString()
  @MaxLength(150)
  reviewerName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  reviewerPhone?: string;

  @IsOptional()
  @IsIn(REVIEW_SOURCES)
  source?: ReviewSource;
}

// Editing an existing review -- rating/comment/attribution can all change;
// targetType/targetId cannot (that's "delete and re-add", not "edit").
export class AdminUpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  comment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  reviewerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  reviewerPhone?: string;

  @IsOptional()
  @IsIn(REVIEW_SOURCES)
  source?: ReviewSource;

  // Admin override for the "Verified purchase"/"Verified by Griffy team"
  // badge -- independent of isAdminAdded, since a real customer's review can
  // be manually verified (or a suspicious one manually unverified) too.
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
