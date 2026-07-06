import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Min, MaxLength } from 'class-validator';
import { BookingStatus, UserRole } from '@prisma/client';

export class CreateBookingDto {
  @IsUUID()
  providerId!: string;

  @IsEnum(UserRole)
  providerRole!: UserRole;

  @IsISO8601()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
