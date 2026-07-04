import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class ReplyEnquiryDto {
  @IsString()
  @IsNotEmpty()
  reply: string;

  @IsString()
  @IsIn(['replied', 'accepted', 'declined'])
  @IsOptional()
  status?: string;
}
