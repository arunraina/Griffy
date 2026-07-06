import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FurnishingStatus, PropertyType } from '@prisma/client';

type CreateDto = {
  title: string;
  description?: string;
  propertyType: PropertyType;
  furnishing: FurnishingStatus;
  areaSqFt: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  imageUrls?: string[];
};

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(city?: string, propertyType?: PropertyType) {
    return this.prisma.property.findMany({
      where: {
        isAvailable: true,
        isHidden: false,
        seller: { user: { isSuspended: false } },
        ...(city ? { city } : {}),
        ...(propertyType ? { propertyType } : {}),
      },
      include: { seller: { select: { user: { select: { name: true } } } } },
      orderBy: [{ isDemoted: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findBySeller(userId: string) {
    const profile = await this.prisma.propertySellerProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.property.findMany({ where: { sellerId: profile.id }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { seller: { select: { user: { select: { name: true, phone: true } } } } },
    });
    if (!property || property.isHidden) throw new NotFoundException('Property listing not found');
    return property;
  }

  async create(userId: string, data: CreateDto) {
    const profile = await this.prisma.propertySellerProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException('No property seller profile found');
    if (profile.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException('Property seller profile is not yet approved');
    }
    return this.prisma.property.create({ data: { ...data, sellerId: profile.id } });
  }

  async update(id: string, userId: string, data: Partial<CreateDto> & { isAvailable?: boolean }) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { seller: { select: { userId: true } } },
    });
    if (!property) throw new NotFoundException('Property listing not found');
    if (property.seller.userId !== userId) throw new ForbiddenException();
    return this.prisma.property.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { seller: { select: { userId: true } } },
    });
    if (!property) throw new NotFoundException('Property listing not found');
    if (property.seller.userId !== userId) throw new ForbiddenException();
    return this.prisma.property.delete({ where: { id } });
  }
}
