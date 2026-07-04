import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

type CreateDto = {
  agencyName?: string;
  licenseNumber?: string;
  serviceCities?: string[];
  bio?: string;
};

type UpdateDto = Partial<CreateDto>;

@Injectable()
export class PropertyAgentProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(city?: string) {
    return this.prisma.propertyAgentProfile.findMany({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        ...(city ? { serviceCities: { has: city } } : {}),
      },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { avgRating: 'desc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.propertyAgentProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, avatarUrl: true, email: true } } },
    });
    if (!profile) throw new NotFoundException('Property agent profile not found');
    return profile;
  }

  findByUser(userId: string) {
    return this.prisma.propertyAgentProfile.findUnique({ where: { userId } });
  }

  async create(userId: string, data: CreateDto) {
    const existing = await this.prisma.propertyAgentProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Profile already exists');
    return this.prisma.propertyAgentProfile.create({ data: { userId, ...data } });
  }

  async update(id: string, userId: string, data: UpdateDto) {
    const profile = await this.prisma.propertyAgentProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Property agent profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    return this.prisma.propertyAgentProfile.update({ where: { id }, data });
  }

  async setApprovalStatus(id: string, status: ApprovalStatus, adminId: string, rejectionReason?: string) {
    const profile = await this.prisma.propertyAgentProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Property agent profile not found');
    return this.prisma.propertyAgentProfile.update({
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
