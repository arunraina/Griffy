import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus, ProjectStatus } from '@prisma/client';

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
  constructor(private readonly prisma: PrismaService) {}

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

    switch (type) {
      case 'contractor': return this.prisma.contractorProfile.update({ where: { id }, data });
      case 'labour': return this.prisma.labourProfile.update({ where: { id }, data });
      case 'service-expert': return this.prisma.serviceExpertProfile.update({ where: { id }, data });
      case 'material-supplier': return this.prisma.materialSupplierProfile.update({ where: { id }, data });
      case 'land-owner': return this.prisma.landOwnerProfile.update({ where: { id }, data });
      case 'property-seller': return this.prisma.propertySellerProfile.update({ where: { id }, data });
      case 'builder': return this.prisma.builderProfile.update({ where: { id }, data });
      case 'property-agent': return this.prisma.propertyAgentProfile.update({ where: { id }, data });
      default: throw new NotFoundException('Unknown profile type');
    }
  }

  async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
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
    const [pendingByType, hiddenCounts, careerCount, earlyAccessCount, totalUsers] = await Promise.all([
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
    ]);

    const [hiddenReviews, hiddenProjects, hiddenLands, hiddenProperties, hiddenMaterials] = hiddenCounts;

    return {
      pendingApprovals: pendingByType,
      totalPendingApprovals: pendingByType.reduce((sum, p) => sum + p.pending, 0),
      hiddenContent: { review: hiddenReviews, project: hiddenProjects, land: hiddenLands, property: hiddenProperties, material: hiddenMaterials },
      careerApplications: careerCount,
      earlyAccessSignups: earlyAccessCount,
      totalUsers,
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
}
