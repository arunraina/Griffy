import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class PropertySellerProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.propertySellerProfile.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED, isAvailable: true },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.propertySellerProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, avatarUrl: true } }, properties: true },
    });
    if (!profile) throw new NotFoundException('Property seller profile not found');
    return profile;
  }

  findByUser(userId: string) {
    return this.prisma.propertySellerProfile.findUnique({ where: { userId } });
  }

  async create(userId: string, data: { bio?: string }) {
    const existing = await this.prisma.propertySellerProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Profile already exists');
    return this.prisma.propertySellerProfile.create({ data: { userId, ...data } });
  }

  async update(id: string, userId: string, data: { bio?: string }) {
    const profile = await this.prisma.propertySellerProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Property seller profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    return this.prisma.propertySellerProfile.update({ where: { id }, data });
  }

  async setApprovalStatus(id: string, status: ApprovalStatus, adminId: string, rejectionReason?: string) {
    const profile = await this.prisma.propertySellerProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Property seller profile not found');
    return this.prisma.propertySellerProfile.update({
      where: { id },
      data: {
        approvalStatus: status,
        approvedBy: adminId,
        approvedAt: status === ApprovalStatus.APPROVED ? new Date() : null,
        rejectionReason: rejectionReason ?? null,
      },
    });
  }
}
