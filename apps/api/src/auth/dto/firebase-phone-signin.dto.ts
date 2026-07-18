import { IsString, MinLength } from 'class-validator';

export class FirebasePhoneSigninDto {
  @IsString()
  @MinLength(10)
  idToken!: string;
}
