import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

type CreateDto = {
  contractorType: string;
  tradeSkills: string[];
  experience: string;
  serviceCities: string[];
  licenseNumber?: string;
  dailyRate?: number;
  projectRate?: number;
  availability?: boolean;
  bio?: string;
  portfolioImages?: string[];
};

type UpdateDto = Partial<CreateDto>;

@Injectable()
export class ContractorProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(city?: string) {
    return this.prisma.contractorProfile.findMany({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        ...(city ? { serviceCities: { has: city } } : {}),
      },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { avgRating: 'desc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.contractorProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, avatarUrl: true, email: true } } },
    });
    if (!profile) throw new NotFoundException('Contractor profile not found');
    return profile;
  }

  async findByUser(userId: string) {
    return this.prisma.contractorProfile.findUnique({ where: { userId } });
  }

  async create(userId: string, data: CreateDto) {
    const existing = await this.prisma.contractorProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Profile already exists');

    return this.prisma.contractorProfile.create({
      data: { userId, ...data },
    });
  }

  async update(id: string, userId: string, data: UpdateDto) {
    const profile = await this.prisma.contractorProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Contractor profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    return this.prisma.contractorProfile.update({ where: { id }, data });
  }

  async setApprovalStatus(id: string, status: ApprovalStatus, adminId: string, rejectionReason?: string) {
    const profile = await this.prisma.contractorProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Contractor profile not found');
    return this.prisma.contractorProfile.update({
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
