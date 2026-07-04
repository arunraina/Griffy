import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SaveItemDto {
  @IsEnum(['contractor', 'labour', 'material'])
  type: 'contractor' | 'labour' | 'material';

  @IsString()
  @IsNotEmpty()
  targetId: string;
}
