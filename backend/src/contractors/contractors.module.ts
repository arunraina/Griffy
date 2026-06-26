import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractorsService } from './contractors.service';
import { ContractorsController } from './contractors.controller';
import { Contractor } from './contractor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contractor])],
  providers: [ContractorsService],
  controllers: [ContractorsController],
  exports: [ContractorsService],
})
export class ContractorsModule {}
