import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { ReviewTargetType, User } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  findByTarget(
    @Query('targetType') targetType: ReviewTargetType,
    @Query('targetId') targetId: string,
  ) {
    return this.reviews.findByTarget(targetType, targetId);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: User,
    @Body()
    body: { targetType: ReviewTargetType; targetId: string; rating: number; comment?: string },
  ) {
    return this.reviews.create(user.id, body);
  }
}
