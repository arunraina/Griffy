import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, Min, MaxLength, ValidateNested } from 'class-validator';

export class CreateLabourProfileDto {
  @IsString()
  @MaxLength(100)
  skillType!: string;

  @IsString()
  @MaxLength(100)
  experience!: string;

  @IsArray()
  @IsString({ each: true })
  serviceCities!: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioImages?: string[];

  // L3 dry-spell "mark available for urgent work" -- an ISO timestamp
  // 7 days out, or null to clear it. Rides the existing generic profile
  // update route rather than a dedicated endpoint (a plain nullable
  // DateTime, unlike weeklyAvailability's nested-object shape above).
  @IsOptional()
  @IsISO8601()
  urgentAvailableUntil?: string | null;
}

export class UpdateLabourProfileDto extends PartialType(CreateLabourProfileDto) {}

export class WeeklyAvailabilityDto {
  @IsBoolean() mon!: boolean;
  @IsBoolean() tue!: boolean;
  @IsBoolean() wed!: boolean;
  @IsBoolean() thu!: boolean;
  @IsBoolean() fri!: boolean;
  @IsBoolean() sat!: boolean;
  @IsBoolean() sun!: boolean;
}

export class SetWeeklyAvailabilityDto {
  @ValidateNested()
  @Type(() => WeeklyAvailabilityDto)
  weeklyAvailability!: WeeklyAvailabilityDto;
}
