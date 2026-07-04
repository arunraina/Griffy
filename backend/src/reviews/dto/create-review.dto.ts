import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewTargetType } from '../review.entity';

export class CreateReviewDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ enum: ReviewTargetType })
  @IsEnum(ReviewTargetType)
  targetType: ReviewTargetType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
