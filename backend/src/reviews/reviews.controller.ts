import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewTargetType } from './review.entity';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateReviewDto, @Request() req: any) {
    return this.reviewsService.create(dto, req.user.id);
  }

  @Get()
  @ApiQuery({ name: 'targetType', enum: ReviewTargetType })
  @ApiQuery({ name: 'targetId' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findForTarget(
    @Query('targetType') targetType: ReviewTargetType,
    @Query('targetId') targetId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.reviewsService.findForTarget(targetType, targetId, page, limit);
  }

  @Get('my-review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'orderId' })
  findByOrder(@Query('orderId') orderId: string, @Request() req: any) {
    return this.reviewsService.findByOrder(orderId, req.user.id);
  }
}
