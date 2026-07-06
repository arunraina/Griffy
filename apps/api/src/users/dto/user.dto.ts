import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

export class SetRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
