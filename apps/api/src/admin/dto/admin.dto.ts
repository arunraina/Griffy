import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProjectStatus, UserRole } from '@prisma/client';

// Union of every field any of the 8 supply-side ProfileType tables accepts —
// CreateUserService.createUser() picks the subset relevant to dto.role and
// enforces which of them are actually required for that role.
export class CreateUserProfileDto {
  @IsOptional() @IsString() contractorType?: string;
  @IsOptional() @IsString() skillType?: string;
  @IsOptional() @IsString() expertiseType?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tradeSkills?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) qualifications?: string[];
  @IsOptional() @IsString() experience?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) serviceCities?: string[];
  @IsOptional() @IsString() licenseNumber?: string;
  @IsOptional() @IsNumber() dailyRate?: number;
  @IsOptional() @IsNumber() projectRate?: number;
  @IsOptional() @IsNumber() consultationFee?: number;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() businessName?: string;
  @IsOptional() @IsString() gstNumber?: string;
  @IsOptional() @IsString() businessAddress?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) deliveryCities?: string[];
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() registrationNumber?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) specializations?: string[];
  @IsOptional() @IsString() agencyName?: string;
}

export class CreateUserDto {
  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateUserProfileDto)
  profile?: CreateUserProfileDto;
}

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
