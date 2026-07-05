import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CareerApplicationsService } from './career-applications.service';
import { DegreeStatus } from '@prisma/client';

interface CreateBody {
  role: string;
  name: string;
  email: string;
  resumeUrl: string;
  institute: string;
  courseOrDegree: string;
  degreeStatus: DegreeStatus;
  graduationYear: number;
}

const REQUIRED_FIELDS: (keyof CreateBody)[] = [
  'role', 'name', 'email', 'resumeUrl', 'institute', 'courseOrDegree', 'degreeStatus', 'graduationYear',
];

@Controller('career-applications')
export class CareerApplicationsController {
  constructor(private readonly service: CareerApplicationsService) {}

  @Post()
  create(@Body() body: CreateBody) {
    for (const field of REQUIRED_FIELDS) {
      if (!body[field]) throw new BadRequestException(`${field} is required`);
    }
    if (!['PURSUING', 'COMPLETED'].includes(body.degreeStatus)) {
      throw new BadRequestException('degreeStatus must be PURSUING or COMPLETED');
    }
    return this.service.create(body);
  }
}
