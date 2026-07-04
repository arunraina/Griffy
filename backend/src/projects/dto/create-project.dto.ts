import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ProjectType } from '../project.entity';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ProjectType)
  projectType: ProjectType;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMax?: number;

  @IsString()
  @IsOptional()
  timeline?: string;
}
