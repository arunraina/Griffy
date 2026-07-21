import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import type { UserState, ProfileStatus } from './dashboard.types';

type ProfileType =
  | 'contractor'
  | 'labour'
  | 'service-expert'
  | 'material-supplier'
  | 'land-owner'
  | 'property-seller'
  | 'builder'
  | 'property-agent';

// Mirrors AdminService.ROLE_TO_PROFILE_TYPE (apps/api/src/admin/admin.service.ts) —
// the 8 supply-side roles each have exactly one 1:1 profile table.
const ROLE_TO_PROFILE_TYPE: Partial<Record<UserRole, ProfileType>> = {
  CONTRACTOR: 'contractor',
  LABOUR: 'labour',
  SERVICE_EXPERT: 'service-expert',
  MATERIAL_SUPPLIER: 'material-supplier',
  LAND_OWNER: 'land-owner',
  PROPERTY_SELLER: 'property-seller',
  BUILDER: 'builder',
  PROPERTY_AGENT: 'property-agent',
};

const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] as const;
const INACTIVE_ORDER_STATUSES = ['DELIVERED', 'CANCELLED', 'REJECTED'] as const;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getState(user: User): Promise<UserState> {
    const profileType = ROLE_TO_PROFILE_TYPE[user.role];

    const [
      profile,
      activeBookingsCount,
      pendingJobsCount,
      activeOrdersCount,
      analytics,
      hasReviews,
    ] = await Promise.all([
      profileType ? this.findProfile(profileType, user.id) : Promise.resolve(null),
      this.prisma.booking.count({
        where: { customerId: user.id, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
      }),
      this.prisma.booking.count({
        where: { providerId: user.id, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
      }),
      this.prisma.order.count({
        where: { buyerId: user.id, status: { notIn: [...INACTIVE_ORDER_STATUSES] } },
      }),
      Promise.all([
        this.prisma.booking.count({ where: { providerId: user.id, status: 'COMPLETED' } }),
        this.prisma.booking.aggregate({ where: { providerId: user.id, status: 'COMPLETED' }, _sum: { amount: true } }),
        this.prisma.order.aggregate({ where: { buyerId: user.id, paymentStatus: 'PAID' }, _sum: { totalAmount: true } }),
      ]),
      this.prisma.review.count({ where: { reviewerId: user.id } }),
    ]);

    const [totalCompletedJobs, earnedAgg, spentAgg] = analytics;

    return {
      isLoggedIn: true,
      role: user.role,

      hasProfile: !!profile,
      profileStatus: (profile?.approvalStatus as ProfileStatus | undefined) ?? 'NONE',
      isFirstLogin: user.loginCount <= 1,
      profileCompleteness: profile ? this.profileCompleteness(user, profileType!, profile) : 0,

      hasBookings: activeBookingsCount > 0,
      hasOrders: activeOrdersCount > 0,
      hasProjects: false, // Phase 2: wire real turnkey-project data
      activeBookingsCount,
      activeOrdersCount,
      pendingJobsCount,

      totalCompletedJobs,
      totalSpent: Number(spentAgg._sum.totalAmount ?? 0),
      totalEarned: Number(earnedAgg._sum.amount ?? 0),
      hasReviews: hasReviews > 0,
      badges: [], // Phase 2: reuse apps/web/src/lib/gamification's tier logic

      city: user.city,
      preferredCategories: [],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private findProfile(type: ProfileType, userId: string): Promise<any | null> {
    switch (type) {
      case 'contractor': return this.prisma.contractorProfile.findUnique({ where: { userId } });
      case 'labour': return this.prisma.labourProfile.findUnique({ where: { userId } });
      case 'service-expert': return this.prisma.serviceExpertProfile.findUnique({ where: { userId } });
      case 'material-supplier': return this.prisma.materialSupplierProfile.findUnique({ where: { userId } });
      case 'land-owner': return this.prisma.landOwnerProfile.findUnique({ where: { userId } });
      case 'property-seller': return this.prisma.propertySellerProfile.findUnique({ where: { userId } });
      case 'builder': return this.prisma.builderProfile.findUnique({ where: { userId } });
      case 'property-agent': return this.prisma.propertyAgentProfile.findUnique({ where: { userId } });
    }
  }

  // Role-specific weighted completeness (0-100). Land Owner/Property Seller/
  // Property Agent have far fewer fields in the schema (mostly just `bio`),
  // so their score is necessarily coarser — a real schema constraint, not a
  // bug in this formula.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private profileCompleteness(user: User, type: ProfileType, profile: any): number {
    let score = 0;
    const has = (v: unknown) => (Array.isArray(v) ? v.length > 0 : !!v);

    if (has(user.name)) score += 10;
    if (has(user.phone)) score += 10;
    if (has(user.city)) score += 10;
    if (has(user.avatarUrl)) score += 15;

    switch (type) {
      case 'contractor':
        if (has(profile.tradeSkills)) score += 15;
        if (has(profile.experience)) score += 10;
        if (profile.dailyRate != null || profile.projectRate != null) score += 10;
        if (has(profile.bio)) score += 10;
        if ((profile.portfolioImages?.length ?? 0) >= 3) score += 10;
        break;
      case 'labour':
        if (has(profile.skillType)) score += 15;
        if (has(profile.experience)) score += 10;
        if (profile.dailyRate != null) score += 10;
        if (has(profile.bio)) score += 10;
        if ((profile.portfolioImages?.length ?? 0) >= 3) score += 10;
        break;
      case 'service-expert':
        if (has(profile.expertiseType)) score += 15;
        if (has(profile.experience)) score += 10;
        if (profile.consultationFee != null) score += 10;
        if (has(profile.bio)) score += 10;
        if ((profile.portfolioImages?.length ?? 0) >= 3) score += 10;
        break;
      case 'builder':
        if (has(profile.specializations)) score += 15;
        if (has(profile.companyName)) score += 10;
        if (has(profile.serviceCities)) score += 10;
        if (has(profile.bio)) score += 10;
        if ((profile.portfolioImages?.length ?? 0) >= 3) score += 10;
        break;
      case 'material-supplier':
        // No bio/portfolio/experience on this table — redistribute across
        // what actually exists.
        if (has(profile.businessName)) score += 20;
        if (has(profile.businessAddress)) score += 20;
        if (has(profile.deliveryCities)) score += 15;
        if (has(profile.gstNumber)) score += 20;
        break;
      case 'property-agent':
        if (has(profile.agencyName)) score += 20;
        if (has(profile.licenseNumber)) score += 20;
        if (has(profile.serviceCities)) score += 20;
        if (has(profile.bio)) score += 15;
        break;
      case 'land-owner':
      case 'property-seller':
        // Schema only really offers `bio` + govtIdVerified beyond the
        // common User fields above.
        if (has(profile.bio)) score += 30;
        if (profile.govtIdVerified) score += 25;
        break;
    }

    return Math.min(100, score);
  }
}
