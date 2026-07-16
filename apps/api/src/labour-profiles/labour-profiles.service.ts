import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

type CreateDto = {
  skillType: string;
  experience: string;
  serviceCities: string[];
  dailyRate?: number;
  isAvailable?: boolean;
  bio?: string;
  portfolioImages?: string[];
};

type UpdateDto = Partial<CreateDto>;

@Injectable()
export class LabourProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(city?: string) {
    return this.prisma.labourProfile.findMany({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        isAvailable: true,
        user: { isSuspended: false },
        ...(city ? { serviceCities: { has: city } } : {}),
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { avgRating: 'desc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.labourProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, avatarUrl: true, email: true } } },
    });
    if (!profile) throw new NotFoundException('Labour profile not found');
    return profile;
  }

  findByUser(userId: string) {
    return this.prisma.labourProfile.findUnique({ where: { userId } });
  }

  async create(userId: string, data: CreateDto) {
    const existing = await this.prisma.labourProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Profile already exists');
    return this.prisma.labourProfile.create({
      data: { userId, ...data },
    });
  }

  async update(id: string, userId: string, data: UpdateDto) {
    const profile = await this.prisma.labourProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Labour profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    return this.prisma.labourProfile.update({ where: { id }, data });
  }

  async setApprovalStatus(id: string, status: ApprovalStatus, adminId: string, rejectionReason?: string) {
    const profile = await this.prisma.labourProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Labour profile not found');
    return this.prisma.labourProfile.update({
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
