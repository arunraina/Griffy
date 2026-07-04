import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/user.entity';
import { Contractor } from '../contractors/contractor.entity';
import { Material } from '../materials/material.entity';
import { Order } from '../orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Contractor, Material, Order])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
