import { Body, Controller, Post } from '@nestjs/common';
import { CareerApplicationsService } from './career-applications.service';
import { CreateCareerApplicationDto } from './dto/career-application.dto';

@Controller('career-applications')
export class CareerApplicationsController {
  constructor(private readonly service: CareerApplicationsService) {}

  @Post()
  create(@Body() body: CreateCareerApplicationDto) {
    return this.service.create(body);
  }
}
