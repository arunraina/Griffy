import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewTargetType, UserRole } from '@prisma/client';
import { AdminCreateReviewDto, AdminUpdateReviewDto } from './dto/review.dto';

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

// Only these target types have a real completed-transaction record to check
// against (Booking or Order). BUILDER/PROPERTY_AGENT/LAND/PROPERTY have no
// transaction system built yet, so reviews there stay open and unverified.
const PROVIDER_ROLE_TARGETS: ReviewTargetType[] = ['CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT'];

export interface ReviewEligibility {
  eligible: boolean;
  wouldBeVerified: boolean;
  reason?: string;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findByTarget(targetType: ReviewTargetType, targetId: string) {
    return this.prisma.review.findMany({
      where: { targetType, [TARGET_FK[targetType]]: targetId, isHidden: false },
      include: { reviewer: { select: { name: true, avatarUrl: true } } },
      orderBy: [{ isDemoted: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async checkEligibility(reviewerId: string, targetType: ReviewTargetType, targetId: string): Promise<ReviewEligibility> {
    const existing = await this.prisma.review.findFirst({
      where: { reviewerId, targetType, [TARGET_FK[targetType]]: targetId },
      select: { id: true },
    });
    if (existing) {
      return { eligible: false, wouldBeVerified: false, reason: 'You\'ve already reviewed this.' };
    }

    if (PROVIDER_ROLE_TARGETS.includes(targetType)) {
      const hasCompletedBooking = await this.hasCompletedBooking(reviewerId, targetType, targetId);
      if (!hasCompletedBooking) {
        return {
          eligible: false,
          wouldBeVerified: false,
          reason: 'You can only review someone after completing a booking with them.',
        };
      }
      return { eligible: true, wouldBeVerified: true };
    }

    if (targetType === 'MATERIAL' || targetType === 'MATERIAL_SUPPLIER') {
      const hasPaidOrder = await this.hasPaidOrder(reviewerId, targetType, targetId);
      if (!hasPaidOrder) {
        return {
          eligible: false,
          wouldBeVerified: false,
          reason: targetType === 'MATERIAL'
            ? 'You can only review a material after purchasing it.'
            : 'You can only review a supplier after purchasing from them.',
        };
      }
      return { eligible: true, wouldBeVerified: true };
    }

    // BUILDER, PROPERTY_AGENT, LAND, PROPERTY — no transaction system, open to all.
    return { eligible: true, wouldBeVerified: false };
  }

  async create(
    reviewerId: string,
    data: { targetType: ReviewTargetType; targetId: string; rating: number; comment?: string },
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const eligibility = await this.checkEligibility(reviewerId, data.targetType, data.targetId);
    if (!eligibility.eligible) {
      if (eligibility.reason === 'You\'ve already reviewed this.') {
        throw new ConflictException(eligibility.reason);
      }
      throw new ForbiddenException(eligibility.reason);
    }

    const review = await this.prisma.review.create({
      data: {
        reviewerId,
        targetType: data.targetType,
        rating: data.rating,
        comment: data.comment,
        isVerified: eligibility.wouldBeVerified,
        [TARGET_FK[data.targetType]]: data.targetId,
      },
    });

    await this.updateAggregates(data.targetType, data.targetId);
    return review;
  }

  // Bypasses checkEligibility entirely -- there's no booking/order to verify
  // against for feedback a customer gave over the phone, so isVerified is
  // always false here (displayed as "Verified by Griffy team" instead of
  // "Verified purchase" on the frontend, a different claim about the same
  // trustworthiness signal).
  async adminCreate(dto: AdminCreateReviewDto, adminId: string) {
    const review = await this.prisma.review.create({
      data: {
        targetType: dto.targetType,
        rating: dto.rating,
        comment: dto.comment,
        reviewerName: dto.reviewerName,
        reviewerPhone: dto.reviewerPhone,
        source: dto.source,
        isAdminAdded: true,
        isVerified: false,
        adminAddedById: adminId,
        [TARGET_FK[dto.targetType]]: dto.targetId,
      },
    });

    await this.updateAggregates(dto.targetType, dto.targetId);
    return review;
  }

  async adminUpdate(id: string, dto: AdminUpdateReviewDto) {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Review not found');

    const review = await this.prisma.review.update({ where: { id }, data: dto });

    if (dto.rating !== undefined) {
      const targetId = this.resolveTargetId(existing);
      if (targetId) await this.updateAggregates(existing.targetType, targetId);
    }
    return review;
  }

  async adminDelete(id: string) {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Review not found');

    await this.prisma.review.delete({ where: { id } });

    const targetId = this.resolveTargetId(existing);
    if (targetId) await this.updateAggregates(existing.targetType, targetId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private resolveTargetId(review: any): string | null {
    return review[TARGET_FK[review.targetType as ReviewTargetType]] ?? null;
  }

  private async hasCompletedBooking(reviewerId: string, targetType: ReviewTargetType, profileId: string): Promise<boolean> {
    const userId = await this.resolveProviderUserId(targetType, profileId);
    if (!userId) return false;

    const booking = await this.prisma.booking.findFirst({
      where: {
        customerId: reviewerId,
        providerId: userId,
        providerRole: targetType as unknown as UserRole,
        status: 'COMPLETED',
      },
      select: { id: true },
    });
    return !!booking;
  }

  private async resolveProviderUserId(targetType: ReviewTargetType, profileId: string): Promise<string | null> {
    switch (targetType) {
      case 'CONTRACTOR': {
        const p = await this.prisma.contractorProfile.findUnique({ where: { id: profileId }, select: { userId: true } });
        return p?.userId ?? null;
      }
      case 'LABOUR': {
        const p = await this.prisma.labourProfile.findUnique({ where: { id: profileId }, select: { userId: true } });
        return p?.userId ?? null;
      }
      case 'SERVICE_EXPERT': {
        const p = await this.prisma.serviceExpertProfile.findUnique({ where: { id: profileId }, select: { userId: true } });
        return p?.userId ?? null;
      }
      default:
        return null;
    }
  }

  private async hasPaidOrder(reviewerId: string, targetType: ReviewTargetType, targetId: string): Promise<boolean> {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        order: { buyerId: reviewerId, paymentStatus: 'PAID' },
        ...(targetType === 'MATERIAL'
          ? { materialId: targetId }
          : { material: { supplierId: targetId } }),
      },
      select: { id: true },
    });
    return !!orderItem;
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
