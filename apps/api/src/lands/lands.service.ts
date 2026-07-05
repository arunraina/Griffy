import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LandType } from '@prisma/client';

type CreateDto = {
  title: string;
  description?: string;
  landType: LandType;
  areaSqFt: number;
  price: number;
  location: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  imageUrls?: string[];
};

@Injectable()
export class LandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(city?: string, landType?: LandType) {
    return this.prisma.land.findMany({
      where: {
        isAvailable: true,
        isHidden: false,
        ...(city ? { city } : {}),
        ...(landType ? { landType } : {}),
      },
      include: { owner: { select: { user: { select: { name: true } } } } },
      orderBy: [{ isDemoted: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const land = await this.prisma.land.findUnique({
      where: { id },
      include: { owner: { select: { user: { select: { name: true, phone: true } } } } },
    });
    if (!land || land.isHidden) throw new NotFoundException('Land listing not found');
    return land;
  }

  async findByOwner(userId: string) {
    const profile = await this.prisma.landOwnerProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.land.findMany({ where: { ownerId: profile.id }, orderBy: { createdAt: 'desc' } });
  }

  async create(userId: string, data: CreateDto) {
    const profile = await this.prisma.landOwnerProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException('No land owner profile found');
    if (profile.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException('Land owner profile is not yet approved');
    }
    return this.prisma.land.create({ data: { ...data, ownerId: profile.id } });
  }

  async update(id: string, userId: string, data: Partial<CreateDto> & { isAvailable?: boolean }) {
    const land = await this.prisma.land.findUnique({
      where: { id },
      include: { owner: { select: { userId: true } } },
    });
    if (!land) throw new NotFoundException('Land listing not found');
    if (land.owner.userId !== userId) throw new ForbiddenException();
    return this.prisma.land.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    const land = await this.prisma.land.findUnique({
      where: { id },
      include: { owner: { select: { userId: true } } },
    });
    if (!land) throw new NotFoundException('Land listing not found');
    if (land.owner.userId !== userId) throw new ForbiddenException();
    return this.prisma.land.delete({ where: { id } });
  }
}
