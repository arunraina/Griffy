import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewTargetType, ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  create(reporterId: string, targetType: ReviewTargetType, targetId: string, reason: string) {
    return this.prisma.report.create({ data: { reporterId, targetType, targetId, reason } });
  }

  listAll(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : {},
      include: { reporter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  setStatus(id: string, status: ReportStatus) {
    return this.prisma.report.update({ where: { id }, data: { status } });
  }
}
