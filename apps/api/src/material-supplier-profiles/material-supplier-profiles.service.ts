import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

type CreateDto = {
  businessName: string;
  businessAddress: string;
  deliveryCities: string[];
  gstNumber?: string;
};

type UpdateDto = Partial<CreateDto>;

@Injectable()
export class MaterialSupplierProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(city?: string) {
    return this.prisma.materialSupplierProfile.findMany({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        isAvailable: true,
        ...(city ? { deliveryCities: { has: city } } : {}),
      },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { avgRating: 'desc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.materialSupplierProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, avatarUrl: true, email: true } } },
    });
    if (!profile) throw new NotFoundException('Material supplier profile not found');
    return profile;
  }

  findByUser(userId: string) {
    return this.prisma.materialSupplierProfile.findUnique({ where: { userId } });
  }

  async create(userId: string, data: CreateDto) {
    const existing = await this.prisma.materialSupplierProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Profile already exists');
    return this.prisma.materialSupplierProfile.create({ data: { userId, ...data } });
  }

  async update(id: string, userId: string, data: UpdateDto) {
    const profile = await this.prisma.materialSupplierProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Material supplier profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    return this.prisma.materialSupplierProfile.update({ where: { id }, data });
  }

  async setApprovalStatus(id: string, status: ApprovalStatus, adminId: string, rejectionReason?: string) {
    const profile = await this.prisma.materialSupplierProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Material supplier profile not found');
    return this.prisma.materialSupplierProfile.update({
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
