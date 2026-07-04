import { IsString, IsNotEmpty, IsUUID, IsOptional, IsNumber, IsIn, Min } from 'class-validator';

export class CreateEnquiryDto {
  @IsString()
  @IsIn(['contractor', 'labour'])
  recipientType: string;

  @IsUUID()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  projectDescription?: string;
}
