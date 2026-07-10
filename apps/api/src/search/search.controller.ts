import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  async find(@Query() query: SearchQueryDto) {
    if (query.type) {
      return this.search.searchType(query.type, query.q, query.page ?? 1, query.pageSize ?? 20);
    }
    return this.search.searchAll(query.q);
  }
}
