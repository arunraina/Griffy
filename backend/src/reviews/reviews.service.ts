import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewTargetType } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';
import { Material } from '../materials/material.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly repo: Repository<Review>,
    @InjectRepository(Contractor) private readonly contractorRepo: Repository<Contractor>,
    @InjectRepository(Labour) private readonly labourRepo: Repository<Labour>,
    @InjectRepository(Material) private readonly materialRepo: Repository<Material>,
  ) {}

  async create(dto: CreateReviewDto, reviewerId: string): Promise<Review> {
    if (dto.orderId) {
      const existing = await this.repo.findOne({ where: { orderId: dto.orderId, reviewerId } });
      if (existing) throw new ConflictException('You have already reviewed this order');
    }

    const review = this.repo.create({ ...dto, reviewerId });
    await this.repo.save(review);
    await this.recalcRating(dto.targetType, dto.targetId);
    return this.repo.findOne({ where: { id: review.id }, relations: ['reviewer'] });
  }

  async findForTarget(targetType: ReviewTargetType, targetId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { targetType, targetId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findByOrder(orderId: string, reviewerId: string): Promise<Review | null> {
    return this.repo.findOne({ where: { orderId, reviewerId } });
  }

  private async recalcRating(targetType: ReviewTargetType, targetId: string) {
    const all = await this.repo.find({ where: { targetType, targetId }, select: ['rating'] });
    if (all.length === 0) return;
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    const count = all.length;

    if (targetType === ReviewTargetType.CONTRACTOR) {
      await this.contractorRepo.update(targetId, { rating: Math.round(avg * 10) / 10, reviewCount: count });
    } else if (targetType === ReviewTargetType.LABOUR) {
      await this.labourRepo.update(targetId, { rating: Math.round(avg * 10) / 10, reviewCount: count });
    } else if (targetType === ReviewTargetType.MATERIAL) {
      await this.materialRepo.update(targetId, { rating: Math.round(avg * 10) / 10, reviewCount: count });
    }
  }
}
