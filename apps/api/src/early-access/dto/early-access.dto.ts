import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEarlyAccessDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  interest?: string;
}
