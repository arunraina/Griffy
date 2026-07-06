import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EarlyAccessService } from './early-access.service';
import { CreateEarlyAccessDto } from './dto/early-access.dto';

@Controller('early-access')
export class EarlyAccessController {
  constructor(private readonly service: EarlyAccessService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(@Body() body: CreateEarlyAccessDto) {
    return this.service.create(body.email, body.interest);
  }
}
