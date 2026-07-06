import { IsString, Length, Matches } from 'class-validator';

export class SendWhatsappOtpDto {
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'phone must be a valid phone number' })
  phone!: string;
}

export class VerifyWhatsappOtpDto {
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'phone must be a valid phone number' })
  phone!: string;

  @IsString()
  @Length(4, 8)
  otp!: string;
}
