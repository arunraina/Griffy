import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewTargetType } from '@prisma/client';

const TARGET_FK: Record<ReviewTargetType, string> = {
  CONTRACTOR: 'contractorProfileId',
  LABOUR: 'labourProfileId',
  SERVICE_EXPERT: 'serviceExpertProfileId',
  MATERIAL_SUPPLIER: 'materialSupplierProfileId',
  BUILDER: 'builderProfileId',
  PROPERTY_AGENT: 'propertyAgentProfileId',
  MATERIAL: 'materialId',
  LAND: 'landId',
  PROPERTY: 'propertyId',
};

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findByTarget(targetType: ReviewTargetType, targetId: string) {
    return this.prisma.review.findMany({
      where: { targetType, [TARGET_FK[targetType]]: targetId },
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
        [TARGET_FK[data.targetType]]: data.targetId,
      },
    });

    await this.updateAggregates(data.targetType, data.targetId);
    return review;
  }

  private async updateAggregates(targetType: ReviewTargetType, targetId: string) {
    const fkField = TARGET_FK[targetType];
    const agg = await this.prisma.review.aggregate({
      where: { targetType, [fkField]: targetId },
      _avg: { rating: true },
      _count: true,
    });

    const avgRating = agg._avg.rating ?? 0;
    const totalReviews = agg._count;

    switch (targetType) {
      case 'CONTRACTOR':
        await this.prisma.contractorProfile.update({ where: { id: targetId }, data: { avgRating, totalReviews } });
        break;
      case 'LABOUR':
        await this.prisma.labourProfile.update({ where: { id: targetId }, data: { avgRating, totalReviews } });
        break;
      case 'SERVICE_EXPERT':
        await this.prisma.serviceExpertProfile.update({ where: { id: targetId }, data: { avgRating, totalReviews } });
        break;
      case 'MATERIAL_SUPPLIER':
        await this.prisma.materialSupplierProfile.update({ where: { id: targetId }, data: { avgRating, totalReviews } });
        break;
      case 'BUILDER':
        await this.prisma.builderProfile.update({ where: { id: targetId }, data: { avgRating, totalReviews } });
        break;
      case 'PROPERTY_AGENT':
        await this.prisma.propertyAgentProfile.update({ where: { id: targetId }, data: { avgRating, totalReviews } });
        break;
      case 'MATERIAL':
        await this.prisma.material.update({ where: { id: targetId }, data: { avgRating, reviewCount: totalReviews } });
        break;
      // LAND and PROPERTY have no denormalized rating fields
    }
  }
}
