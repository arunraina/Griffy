import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { EarlyAccessService } from './early-access.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Controller('early-access')
export class EarlyAccessController {
  constructor(private readonly service: EarlyAccessService) {}

  @Post()
  create(@Body() body: { email: string; interest?: string }) {
    if (!body.email || !EMAIL_RE.test(body.email)) {
      throw new BadRequestException('A valid email is required');
    }
    return this.service.create(body.email, body.interest);
  }
}
