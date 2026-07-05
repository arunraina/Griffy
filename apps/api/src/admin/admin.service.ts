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
}
