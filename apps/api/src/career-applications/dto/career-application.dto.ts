import { IsEmail, IsEnum, IsInt, IsString, IsUrl, Max, Min, MaxLength } from 'class-validator';
import { DegreeStatus } from '@prisma/client';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateCareerApplicationDto {
  @IsString()
  @MaxLength(100)
  role!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsEmail()
  email!: string;

  @IsUrl()
  resumeUrl!: string;

  @IsString()
  @MaxLength(200)
  institute!: string;

  @IsString()
  @MaxLength(200)
  courseOrDegree!: string;

  @IsEnum(DegreeStatus)
  degreeStatus!: DegreeStatus;

  @IsInt()
  @Min(CURRENT_YEAR - 10)
  @Max(CURRENT_YEAR + 10)
  graduationYear!: number;
}
