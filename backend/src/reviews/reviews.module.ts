import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './review.entity';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';
import { Material } from '../materials/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Contractor, Labour, Material])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
