import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';
import { Enquiry } from '../enquiries/enquiry.entity';
import { Order, OrderStatus } from '../orders/order.entity';
import { Material } from '../materials/material.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Contractor) private readonly contractorRepo: Repository<Contractor>,
    @InjectRepository(Labour) private readonly labourRepo: Repository<Labour>,
    @InjectRepository(Enquiry) private readonly enquiryRepo: Repository<Enquiry>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Material) private readonly materialRepo: Repository<Material>,
  ) {}

  async getMyAnalytics(userId: string, role: string) {
    let profileViews = 0;
    let itemIds: string[] = [];

    if (role === 'contractor') {
      const profile = await this.contractorRepo.findOne({ where: { userId }, select: ['id', 'profileViews', 'completedProjects', 'rating', 'reviewCount'] });
      if (profile) { profileViews = profile.profileViews; itemIds = [profile.id]; }
    } else if (role === 'labour') {
      const profile = await this.labourRepo.findOne({ where: { userId }, select: ['id', 'profileViews', 'completedJobs', 'rating', 'reviewCount'] });
      if (profile) { profileViews = profile.profileViews; itemIds = [profile.id]; }
    } else if (role === 'supplier') {
      const mats = await this.materialRepo.find({ where: { supplierId: userId }, select: ['id'] });
      itemIds = mats.map((m) => m.id);
    }

    const enquiryCount = await this.enquiryRepo.count({ where: { recipientId: userId } });

    const now = new Date();
    const weeks: { label: string; earnings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);

      let earnings = 0;
      if (itemIds.length > 0) {
        const orders = await this.orderRepo
          .createQueryBuilder('o')
          .where('o.itemId IN (:...ids)', { ids: itemIds })
          .andWhere('o.status = :status', { status: OrderStatus.COMPLETED })
          .andWhere('o.createdAt >= :start AND o.createdAt < :end', { start, end })
          .select('SUM(o.amount)', 'sum')
          .getRawOne();
        earnings = Number(orders?.sum ?? 0);
      }

      const d = new Date(end);
      weeks.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, earnings });
    }

    const totalEarnings = weeks.reduce((s, w) => s + w.earnings, 0);

    return { profileViews, enquiryCount, totalEarnings, weeklyEarnings: weeks };
  }
}
