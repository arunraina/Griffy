import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus, ProjectStatus, UserRole, KycStatus, PaymentStatus } from '@prisma/client';
import { KycService } from '../kyc/kyc.service';
import { NotificationsService } from '../notifications/notifications.service';

type ProfileType =
  | 'contractor'
  | 'labour'
  | 'service-expert'
  | 'material-supplier'
  | 'land-owner'
  | 'property-seller'
  | 'builder'
  | 'property-agent';

const PROFILE_TYPES: ProfileType[] = [
  'contractor', 'labour', 'service-expert', 'material-supplier',
  'land-owner', 'property-seller', 'builder', 'property-agent',
];

export type ContentType = 'review' | 'project' | 'land' | 'property' | 'material';

interface ModerateContentInput {
  isHidden?: boolean;
  isDemoted?: boolean;
  moderationNote?: string;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kyc: KycService,
    private readonly notifications: NotificationsService,
  ) {}

  async listProfiles(type: ProfileType, status?: ApprovalStatus) {
    const where = status ? { approvalStatus: status } : {};
    const include = { user: { select: { name: true, email: true, phone: true } } };

    switch (type) {
      case 'contractor': return this.prisma.contractorProfile.findMany({ where, include });
      case 'labour': return this.prisma.labourProfile.findMany({ where, include });
      case 'service-expert': return this.prisma.serviceExpertProfile.findMany({ where, include });
      case 'material-supplier': return this.prisma.materialSupplierProfile.findMany({ where, include });
      case 'land-owner': return this.prisma.landOwnerProfile.findMany({ where, include });
      case 'property-seller': return this.prisma.propertySellerProfile.findMany({ where, include });
      case 'builder': return this.prisma.builderProfile.findMany({ where, include });
      case 'property-agent': return this.prisma.propertyAgentProfile.findMany({ where, include });
      default: throw new NotFoundException('Unknown profile type');
    }
  }

  async setApproval(
    type: ProfileType,
    id: string,
    status: ApprovalStatus,
    adminId: string,
    rejectionReason?: string,
  ) {
    const data = {
      approvalStatus: status,
      approvedBy: adminId,
      approvedAt: status === ApprovalStatus.APPROVED ? new Date() : null,
      rejectionReason: rejectionReason ?? null,
    };

    let profile: { userId: string };
    switch (type) {
      case 'contractor': profile = await this.prisma.contractorProfile.update({ where: { id }, data }); break;
      case 'labour': profile = await this.prisma.labourProfile.update({ where: { id }, data }); break;
      case 'service-expert': profile = await this.prisma.serviceExpertProfile.update({ where: { id }, data }); break;
      case 'material-supplier': profile = await this.prisma.materialSupplierProfile.update({ where: { id }, data }); break;
      case 'land-owner': profile = await this.prisma.landOwnerProfile.update({ where: { id }, data }); break;
      case 'property-seller': profile = await this.prisma.propertySellerProfile.update({ where: { id }, data }); break;
      case 'builder': profile = await this.prisma.builderProfile.update({ where: { id }, data }); break;
      case 'property-agent': profile = await this.prisma.propertyAgentProfile.update({ where: { id }, data }); break;
      default: throw new NotFoundException('Unknown profile type');
    }

    await this.notifications.notify(
      profile.userId,
      status === ApprovalStatus.APPROVED ? 'profile.approved' : 'profile.rejected',
      { reason: rejectionReason },
    );

    return profile;
  }

  async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
  }

  listOrders(paymentStatus?: PaymentStatus) {
    return this.prisma.order.findMany({
      where: paymentStatus ? { paymentStatus } : {},
      include: {
        buyer: { select: { name: true, email: true } },
        refunds: true,
        items: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  listAllProjects(status?: ProjectStatus) {
    return this.prisma.project.findMany({
      where: status ? { status } : {},
      include: { owner: { select: { name: true, email: true } }, _count: { select: { bids: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  moderateProject(id: string, status: ProjectStatus) {
    return this.prisma.project.update({ where: { id }, data: { status } });
  }

  listCareerApplications() {
    return this.prisma.careerApplication.findMany({ orderBy: { createdAt: 'desc' } });
  }

  listEarlyAccessSignups() {
    return this.prisma.earlyAccessSignup.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async listContent(type: ContentType) {
    const orderBy = [{ isDemoted: 'asc' as const }, { createdAt: 'desc' as const }];
    switch (type) {
      case 'review':
        return this.prisma.review.findMany({
          include: { reviewer: { select: { name: true, email: true } } },
          orderBy,
        });
      case 'project':
        return this.prisma.project.findMany({
          include: { owner: { select: { name: true, email: true } }, _count: { select: { bids: true } } },
          orderBy,
        });
      case 'land':
        return this.prisma.land.findMany({
          include: { owner: { select: { user: { select: { name: true, email: true } } } } },
          orderBy,
        });
      case 'property':
        return this.prisma.property.findMany({
          include: { seller: { select: { user: { select: { name: true, email: true } } } } },
          orderBy,
        });
      case 'material':
        return this.prisma.material.findMany({
          include: { supplier: { select: { businessName: true, user: { select: { name: true } } } } },
          orderBy,
        });
      default:
        throw new NotFoundException('Unknown content type');
    }
  }

  async moderateContent(type: ContentType, id: string, data: ModerateContentInput) {
    switch (type) {
      case 'review': return this.prisma.review.update({ where: { id }, data });
      case 'project': return this.prisma.project.update({ where: { id }, data });
      case 'land': return this.prisma.land.update({ where: { id }, data });
      case 'property': return this.prisma.property.update({ where: { id }, data });
      case 'material': return this.prisma.material.update({ where: { id }, data });
      default: throw new NotFoundException('Unknown content type');
    }
  }

  async getDashboardSummary() {
    const [pendingByType, hiddenCounts, careerCount, earlyAccessCount, totalUsers, kycPending] = await Promise.all([
      Promise.all(
        PROFILE_TYPES.map(async (type) => ({
          type,
          pending: await this.countPending(type),
        })),
      ),
      Promise.all([
        this.prisma.review.count({ where: { isHidden: true } }),
        this.prisma.project.count({ where: { isHidden: true } }),
        this.prisma.land.count({ where: { isHidden: true } }),
        this.prisma.property.count({ where: { isHidden: true } }),
        this.prisma.material.count({ where: { isHidden: true } }),
      ]),
      this.prisma.careerApplication.count(),
      this.prisma.earlyAccessSignup.count(),
      this.prisma.user.count(),
      this.prisma.kycDetail.count({ where: { status: 'PENDING' } }),
    ]);

    const [hiddenReviews, hiddenProjects, hiddenLands, hiddenProperties, hiddenMaterials] = hiddenCounts;

    return {
      pendingApprovals: pendingByType,
      totalPendingApprovals: pendingByType.reduce((sum, p) => sum + p.pending, 0),
      hiddenContent: { review: hiddenReviews, project: hiddenProjects, land: hiddenLands, property: hiddenProperties, material: hiddenMaterials },
      careerApplications: careerCount,
      earlyAccessSignups: earlyAccessCount,
      totalUsers,
      kycPending,
    };
  }

  private countPending(type: ProfileType) {
    switch (type) {
      case 'contractor': return this.prisma.contractorProfile.count({ where: { approvalStatus: 'PENDING' } });
      case 'labour': return this.prisma.labourProfile.count({ where: { approvalStatus: 'PENDING' } });
      case 'service-expert': return this.prisma.serviceExpertProfile.count({ where: { approvalStatus: 'PENDING' } });
      case 'material-supplier': return this.prisma.materialSupplierProfile.count({ where: { approvalStatus: 'PENDING' } });
      case 'land-owner': return this.prisma.landOwnerProfile.count({ where: { approvalStatus: 'PENDING' } });
      case 'property-seller': return this.prisma.propertySellerProfile.count({ where: { approvalStatus: 'PENDING' } });
      case 'builder': return this.prisma.builderProfile.count({ where: { approvalStatus: 'PENDING' } });
      case 'property-agent': return this.prisma.propertyAgentProfile.count({ where: { approvalStatus: 'PENDING' } });
    }
  }

  listUsers(search?: string, role?: UserRole) {
    return this.prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  setUserSuspended(id: string, isSuspended: boolean) {
    return this.prisma.user.update({ where: { id }, data: { isSuspended } });
  }

  listKyc(status?: KycStatus) {
    return this.kyc.listAll(status);
  }

  setKycStatus(userId: string, status: KycStatus, rejectionReason?: string) {
    return this.kyc.setStatus(userId, status, rejectionReason);
  }

  async getGrowthMetrics() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      newUsers, newOrders, paidOrders, newBookings, confirmedBookings,
      usersByRole, activeListings, totalProjects, totalBids,
    ] = await Promise.all([
      this.prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      this.prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      this.prisma.order.findMany({ where: { paymentStatus: 'PAID' }, select: { totalAmount: true, createdAt: true } }),
      this.prisma.booking.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      this.prisma.booking.findMany({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }, select: { amount: true, createdAt: true } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      Promise.all([
        this.prisma.contractorProfile.count({ where: { approvalStatus: 'APPROVED' } }),
        this.prisma.labourProfile.count({ where: { approvalStatus: 'APPROVED' } }),
        this.prisma.serviceExpertProfile.count({ where: { approvalStatus: 'APPROVED' } }),
        this.prisma.materialSupplierProfile.count({ where: { approvalStatus: 'APPROVED' } }),
        this.prisma.material.count({ where: { isHidden: false } }),
        this.prisma.land.count({ where: { isAvailable: true, isHidden: false } }),
        this.prisma.property.count({ where: { isAvailable: true, isHidden: false } }),
      ]),
      this.prisma.project.count(),
      this.prisma.bid.count(),
    ]);

    const [contractors, labour, serviceExperts, materialSuppliers, materials, lands, properties] = activeListings;

    const gmvLast30d = paidOrders
      .filter((o) => o.createdAt >= since)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const gmvAllTime = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const bookingsValueAllTime = confirmedBookings.reduce((sum, b) => sum + Number(b.amount), 0);

    return {
      newUsersByDay: bucketByDay(newUsers.map((u) => u.createdAt), since),
      newOrdersByDay: bucketByDay(newOrders.map((o) => o.createdAt), since),
      newBookingsByDay: bucketByDay(newBookings.map((b) => b.createdAt), since),
      gmv: { last30d: gmvLast30d, allTime: gmvAllTime },
      bookingsValueAllTime,
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count._all })),
      activeListings: { contractors, labour, serviceExperts, materialSuppliers, materials, lands, properties },
      totalProjects,
      totalBids,
    };
  }
}

function bucketByDay(dates: Date[], since: Date): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  const day = new Date(since);
  day.setHours(0, 0, 0, 0);
  for (let d = new Date(day); d <= new Date(); d.setDate(d.getDate() + 1)) {
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}
