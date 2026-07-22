import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, IsString, Matches, MaxLength } from 'class-validator';
import { BlogPostStatus } from '@prisma/client';

export class CreateBlogPostDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug must be lowercase letters, numbers, and hyphens only' })
  slug!: string;

  @IsString()
  @MaxLength(500)
  excerpt!: string;

  @IsString()
  content!: string;

  @IsString()
  @MaxLength(200)
  author!: string;

  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readTimeMinutes?: number;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
