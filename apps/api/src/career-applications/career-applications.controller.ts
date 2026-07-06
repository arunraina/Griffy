import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CareerApplicationsService } from './career-applications.service';
import { CreateCareerApplicationDto } from './dto/career-application.dto';

@Controller('career-applications')
export class CareerApplicationsController {
  constructor(private readonly service: CareerApplicationsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(@Body() body: CreateCareerApplicationDto) {
    return this.service.create(body);
  }
}
