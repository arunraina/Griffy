import { Body, Controller, Post } from '@nestjs/common';
import { EarlyAccessService } from './early-access.service';
import { CreateEarlyAccessDto } from './dto/early-access.dto';

@Controller('early-access')
export class EarlyAccessController {
  constructor(private readonly service: EarlyAccessService) {}

  @Post()
  create(@Body() body: CreateEarlyAccessDto) {
    return this.service.create(body.email, body.interest);
  }
}
