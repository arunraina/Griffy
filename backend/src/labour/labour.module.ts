import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabourService } from './labour.service';
import { LabourController } from './labour.controller';
import { Labour } from './labour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Labour])],
  providers: [LabourService],
  controllers: [LabourController],
  exports: [LabourService],
})
export class LabourModule {}
