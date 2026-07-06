import { IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class KycSubmitDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{12}$/, { message: 'aadhaarNumber must be a 12-digit number' })
  aadhaarNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, { message: 'panNumber must be a valid PAN (e.g. ABCDE1234F)' })
  panNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gstNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'bankIfsc must be a valid IFSC code' })
  bankIfsc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  bankAccountHolderName?: string;

  @IsOptional()
  @IsUrl()
  panCardUrl?: string;

  @IsOptional()
  @IsUrl()
  bankProofUrl?: string;
}

export class RejectKycDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
