import { IsIn } from 'class-validator';

export class UploadImageDto {
  @IsIn(['avatars', 'portfolio'])
  folder!: 'avatars' | 'portfolio';
}
