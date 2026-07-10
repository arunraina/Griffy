import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchType } from '../search.service';

const SEARCH_TYPES: SearchType[] = ['contractors', 'labour', 'experts', 'materials', 'properties', 'lands'];

export class SearchQueryDto {
  @IsString()
  @MaxLength(200)
  q!: string;

  @IsOptional()
  @IsIn(SEARCH_TYPES)
  type?: SearchType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}
