import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(
    id: string,
    data: Partial<Pick<User, 'name' | 'phone' | 'avatarUrl' | 'city' | 'state'>>,
  ): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  setRole(id: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async getReferralStats(id: string): Promise<{ code: string; referralCount: number }> {
    const referralCount = await this.prisma.user.count({ where: { referredById: id } });
    return { code: id.replace(/-/g, '').slice(0, 8).toUpperCase(), referralCount };
  }

  async getMyAnalytics(id: string) {
    const [completedJobs, earnings, bidsSubmitted, bidsWon] = await Promise.all([
      this.prisma.booking.count({ where: { providerId: id, status: 'COMPLETED' } }),
      this.prisma.booking.aggregate({ where: { providerId: id, status: 'COMPLETED' }, _sum: { amount: true } }),
      this.prisma.bid.count({ where: { contractorId: id } }),
      this.prisma.bid.count({ where: { contractorId: id, status: 'ACCEPTED' } }),
    ]);
    return {
      completedJobs,
      totalEarnings: Number(earnings._sum.amount ?? 0),
      bidsSubmitted,
      bidsWon,
    };
  }
}
