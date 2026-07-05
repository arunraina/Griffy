import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DegreeStatus } from '@prisma/client';

interface CreateCareerApplicationInput {
  role: string;
  name: string;
  email: string;
  resumeUrl: string;
  institute: string;
  courseOrDegree: string;
  degreeStatus: DegreeStatus;
  graduationYear: number;
}

@Injectable()
export class CareerApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCareerApplicationInput) {
    return this.prisma.careerApplication.create({ data });
  }

  findAll() {
    return this.prisma.careerApplication.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
