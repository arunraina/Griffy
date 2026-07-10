import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsISO8601, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';

export type PortfolioProfileType = 'contractor' | 'labour' | 'service-expert';

export class CreatePortfolioItemDto {
  @IsIn(['contractor', 'labour', 'service-expert'])
  profileType!: PortfolioProfileType;

  @IsString()
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // require_tld: false — local dev serves images from http://localhost:3001
  // (no TLD) when S3 isn't configured; production S3/CDN URLs still pass.
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsUrl({ require_tld: false }, { each: true })
  imageUrls!: string[];

  @IsOptional()
  @IsISO8601()
  completedAt?: string;
}

export class UpdatePortfolioItemDto extends PartialType(OmitType(CreatePortfolioItemDto, ['profileType'] as const)) {}
