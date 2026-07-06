import { IsIn, IsString, MaxLength } from 'class-validator';

export class GetPresignedUrlDto {
  @IsIn(['avatars', 'materials', 'documents'])
  folder!: 'avatars' | 'materials' | 'documents';

  @IsString()
  @MaxLength(100)
  contentType!: string;
}
