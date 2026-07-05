import { Module } from '@nestjs/common';
import { CareerApplicationsController } from './career-applications.controller';
import { CareerApplicationsService } from './career-applications.service';

@Module({
  controllers: [CareerApplicationsController],
  providers: [CareerApplicationsService],
  exports: [CareerApplicationsService],
})
export class CareerApplicationsModule {}
