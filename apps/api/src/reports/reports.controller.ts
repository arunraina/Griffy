import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/report.dto';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateReportDto) {
    return this.reports.create(user.id, body.targetType, body.targetId, body.reason);
  }
}
