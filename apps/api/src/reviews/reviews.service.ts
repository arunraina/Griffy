import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewTargetType } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findByTarget(targetType: ReviewTargetType, targetId: string) {
    return this.prisma.review.findMany({
      where:
        targetType === 'SERVICE_PROVIDER'
          ? { serviceProviderId: targetId }
          : { materialId: targetId },
      include: { reviewer: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    reviewerId: string,
    data: { targetType: ReviewTargetType; targetId: string; rating: number; comment?: string },
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const review = await this.prisma.review.create({
      data: {
        reviewerId,
        targetType: data.targetType,
        rating: data.rating,
        comment: data.comment,
        ...(data.targetType === 'SERVICE_PROVIDER'
          ? { serviceProviderId: data.targetId }
          : { materialId: data.targetId }),
      },
    });

    await this.updateAggregateRating(data.targetType, data.targetId);
    return review;
  }

  private async updateAggregateRating(targetType: ReviewTargetType, targetId: string) {
    const agg = await this.prisma.review.aggregate({
      where:
        targetType === 'SERVICE_PROVIDER'
          ? { serviceProviderId: targetId }
          : { materialId: targetId },
      _avg: { rating: true },
      _count: true,
    });

    const update = { rating: agg._avg.rating ?? 0, reviewCount: agg._count };

    if (targetType === 'SERVICE_PROVIDER') {
      await this.prisma.serviceProvider.update({ where: { id: targetId }, data: update });
    } else {
      await this.prisma.material.update({ where: { id: targetId }, data: update });
    }
  }
}
