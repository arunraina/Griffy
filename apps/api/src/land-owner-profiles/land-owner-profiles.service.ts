import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class LandOwnerProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.landOwnerProfile.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED, isAvailable: true, user: { isSuspended: false } },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.landOwnerProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, avatarUrl: true } }, lands: true },
    });
    if (!profile) throw new NotFoundException('Land owner profile not found');
    return profile;
  }

  findByUser(userId: string) {
    return this.prisma.landOwnerProfile.findUnique({ where: { userId } });
  }

  async create(userId: string, data: { bio?: string }) {
    const existing = await this.prisma.landOwnerProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Profile already exists');
    return this.prisma.landOwnerProfile.create({ data: { userId, ...data } });
  }

  async update(id: string, userId: string, data: { bio?: string }) {
    const profile = await this.prisma.landOwnerProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Land owner profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    return this.prisma.landOwnerProfile.update({ where: { id }, data });
  }

  async setApprovalStatus(id: string, status: ApprovalStatus, adminId: string, rejectionReason?: string) {
    const profile = await this.prisma.landOwnerProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Land owner profile not found');
    return this.prisma.landOwnerProfile.update({
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
