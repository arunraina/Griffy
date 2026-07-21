import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus, ProjectStatus, UserRole, AdminRole, KycStatus, PaymentStatus } from '@prisma/client';
import { KycService } from '../kyc/kyc.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateUserDto, CreateUserProfileDto } from './dto/admin.dto';

export type AdminSection =
  | 'APPROVALS'
  | 'KYC'
  | 'CONTENT_MODERATION'
  | 'REPORTS'
  | 'USERS'
  | 'ORDERS'
  | 'CAREERS'
  | 'EARLY_ACCESS';

// Dashboard/Growth Metrics aren't in here — they're full-access-only (see
// assertAdmin), since a scoped admin (e.g. HR) has nothing meaningful to see
// on a summary that aggregates GMV, bookings, and every profile type.
const SECTION_ACCESS: Record<AdminRole, AdminSection[] | 'ALL'> = {
  SUPER_ADMIN: 'ALL',
  ADMIN: 'ALL',
  CONTENT_MODERATOR: ['CONTENT_MODERATION', 'REPORTS'],
  KYC_MODERATOR: ['KYC'],
  HR: ['CAREERS', 'EARLY_ACCESS'],
};

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

// Only these 8 supply-side roles can be seeded via AdminService.createUser() —
// HOMEOWNER has no profile table to attach, and ADMIN must go through
// UsersService.setRole (see the privilege-escalation note in AuthGuard).
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

  // Base check — "does this row have any admin access at all". Deliberately
  // independent of `role` (the marketplace user type — HOMEOWNER,
  // CONTRACTOR, etc.): an admin can be a HOMEOWNER on the marketplace side
  // and a SUPER_ADMIN on the admin side at the same time. adminRole alone
  // is the source of truth for admin access.
  async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.adminRole) throw new ForbiddenException('Admin access required');
    return user;
  }

  async assertAdminSection(userId: string, section: AdminSection) {
    const user = await this.assertAdmin(userId);
    const access = SECTION_ACCESS[user.adminRole!];
    if (access !== 'ALL' && !access.includes(section)) {
      throw new ForbiddenException(`Your admin role doesn't have access to ${section}`);
    }
    return user;
  }

  // Dashboard/Growth Metrics aggregate across every section (GMV, bookings,
  // every profile type) — a scoped role like HR or KYC Moderator has nothing
  // meaningful to see there, so this requires the full-access tier, not just
  // "is an admin".
  async assertFullAccess(userId: string) {
    const user = await this.assertAdmin(userId);
    const access = SECTION_ACCESS[user.adminRole!];
    if (access !== 'ALL') throw new ForbiddenException('Admin access required');
    return user;
  }

  async setAdminRole(targetUserId: string, adminRole: AdminRole, actingAdminId: string) {
    const actingAdmin = await this.assertAdmin(actingAdminId);
    if (actingAdmin.adminRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only a Super Admin can manage admin roles');
    }
    // `role` (the marketplace user type) is untouched — admin access is
    // purely a function of adminRole, so granting it never reclassifies
    // what kind of marketplace participant this person is.
    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { adminRole },
    });
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

  // Manually seeds a supply-side user (e.g. an electrician the team recruited
  // directly) so the platform has bookable providers before organic signups
  // arrive. Created as isGhost — if the real person later signs up with a
  // matching phone number, AuthGuard.upsertUser() re-keys this same row onto
  // their real Supabase id instead of creating a duplicate account.
  async createUser(dto: CreateUserDto, adminId: string) {
    const profileType = ROLE_TO_PROFILE_TYPE[dto.role];
    if (!profileType) {
      throw new BadRequestException(`Cannot admin-create a user with role ${dto.role}`);
    }

    const id = randomUUID();
    const email = dto.email?.trim() || `${id}@ghost.griffy.internal`;
    // Firebase phone auth stores Supabase user.phone as E.164 digits with no
    // leading "+" (see FirebasePhoneAuthService.mintSession) — normalize the
    // same way so AuthGuard.claimGhostUser()'s phone match actually hits.
    const phone = dto.phone ? dto.phone.replace(/\D/g, '') : null;
    const p = dto.profile ?? {};

    const approval = { approvalStatus: ApprovalStatus.APPROVED, approvedBy: adminId, approvedAt: new Date() };

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id,
          email,
          phone,
          name: dto.name,
          role: dto.role,
          city: dto.city || null,
          state: dto.state || null,
          isGhost: true,
          createdByAdminId: adminId,
        },
      });

      switch (profileType) {
        case 'contractor':
          this.requireProfileFields(p, ['contractorType', 'experience'], dto.role);
          await tx.contractorProfile.create({
            data: {
              userId: id,
              contractorType: p.contractorType!,
              tradeSkills: p.tradeSkills ?? [],
              experience: p.experience!,
              serviceCities: p.serviceCities ?? [],
              licenseNumber: p.licenseNumber,
              dailyRate: p.dailyRate,
              projectRate: p.projectRate,
              bio: p.bio,
              portfolioImages: [],
              ...approval,
            },
          });
          break;
        case 'labour':
          this.requireProfileFields(p, ['skillType', 'experience'], dto.role);
          await tx.labourProfile.create({
            data: {
              userId: id,
              skillType: p.skillType!,
              experience: p.experience!,
              serviceCities: p.serviceCities ?? [],
              dailyRate: p.dailyRate,
              bio: p.bio,
              portfolioImages: [],
              ...approval,
            },
          });
          break;
        case 'service-expert':
          this.requireProfileFields(p, ['expertiseType', 'experience'], dto.role);
          await tx.serviceExpertProfile.create({
            data: {
              userId: id,
              expertiseType: p.expertiseType!,
              qualifications: p.qualifications ?? [],
              experience: p.experience!,
              serviceCities: p.serviceCities ?? [],
              consultationFee: p.consultationFee,
              bio: p.bio,
              portfolioImages: [],
              ...approval,
            },
          });
          break;
        case 'material-supplier':
          this.requireProfileFields(p, ['businessName', 'businessAddress'], dto.role);
          await tx.materialSupplierProfile.create({
            data: {
              userId: id,
              businessName: p.businessName!,
              gstNumber: p.gstNumber,
              businessAddress: p.businessAddress!,
              deliveryCities: p.deliveryCities ?? [],
              ...approval,
            },
          });
          break;
        case 'land-owner':
          await tx.landOwnerProfile.create({ data: { userId: id, bio: p.bio, ...approval } });
          break;
        case 'property-seller':
          await tx.propertySellerProfile.create({ data: { userId: id, bio: p.bio, ...approval } });
          break;
        case 'builder':
          this.requireProfileFields(p, ['companyName'], dto.role);
          await tx.builderProfile.create({
            data: {
              userId: id,
              companyName: p.companyName!,
              registrationNumber: p.registrationNumber,
              specializations: p.specializations ?? [],
              serviceCities: p.serviceCities ?? [],
              bio: p.bio,
              portfolioImages: [],
              ...approval,
            },
          });
          break;
        case 'property-agent':
          await tx.propertyAgentProfile.create({
            data: {
              userId: id,
              agencyName: p.agencyName,
              licenseNumber: p.licenseNumber,
              serviceCities: p.serviceCities ?? [],
              bio: p.bio,
              ...approval,
            },
          });
          break;
      }

      return user;
    });
  }

  private requireProfileFields(profile: CreateUserProfileDto, fields: (keyof CreateUserProfileDto)[], role: UserRole) {
    const missing = fields.filter((f) => !profile[f]);
    if (missing.length) {
      throw new BadRequestException(`${role} profile is missing required field(s): ${missing.join(', ')}`);
    }
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
