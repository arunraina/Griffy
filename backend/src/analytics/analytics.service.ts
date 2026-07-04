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
      const p = await this.contractorRepo.findOne({ where: { userId }, select: ['id', 'profileViews'] });
      if (p) { profileViews = p.profileViews; itemIds = [p.id]; }
    } else if (role === 'labour') {
      const p = await this.labourRepo.findOne({ where: { userId }, select: ['id', 'profileViews'] });
      if (p) { profileViews = p.profileViews; itemIds = [p.id]; }
    } else if (role === 'supplier') {
      const mats = await this.materialRepo.find({ where: { supplierId: userId }, select: ['id'] });
      itemIds = mats.map((m) => m.id);
    }

    // Two parallel queries instead of 7 sequential
    const [enquiryCount, recentOrders] = await Promise.all([
      this.enquiryRepo.count({ where: { recipientId: userId } }),
      itemIds.length > 0
        ? this.orderRepo
            .createQueryBuilder('o')
            .where('o.itemId IN (:...ids)', { ids: itemIds })
            .andWhere('o.status = :s', { s: OrderStatus.COMPLETED })
            .andWhere('o.createdAt >= :since', { since: new Date(Date.now() - 42 * 86400000) })
            .select(['o.createdAt', 'o.amount'])
            .getMany()
        : Promise.resolve([] as Order[]),
    ]);

    // Bucket in JS — no extra round trips
    const now = Date.now();
    const weeks: { label: string; earnings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date(now - i * 7 * 86400000);
      const start = new Date(end.getTime() - 7 * 86400000);
      const earnings = recentOrders
        .filter((o) => new Date(o.createdAt) >= start && new Date(o.createdAt) < end)
        .reduce((s, o) => s + Number(o.amount), 0);
      weeks.push({ label: `${end.getDate()}/${end.getMonth() + 1}`, earnings });
    }

    const totalEarnings = weeks.reduce((s, w) => s + w.earnings, 0);
    return { profileViews, enquiryCount, totalEarnings, weeklyEarnings: weeks };
  }
}
