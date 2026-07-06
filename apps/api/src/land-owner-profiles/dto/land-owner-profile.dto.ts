import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLandOwnerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;
}

export class UpdateLandOwnerProfileDto extends PartialType(CreateLandOwnerProfileDto) {}
