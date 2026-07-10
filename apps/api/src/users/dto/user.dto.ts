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

  // require_tld: false — local dev serves images from http://localhost:3001
  // (no TLD) when S3 isn't configured; production S3/CDN URLs still pass.
  @IsOptional()
  @IsUrl({ require_tld: false })
  avatarUrl?: string;
}

export class SetRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
