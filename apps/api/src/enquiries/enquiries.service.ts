import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnquiryStatus, EnquiryTargetType } from '@prisma/client';

type CreateDto = {
  targetType: EnquiryTargetType;
  propertyId?: string;
  landId?: string;
  message: string;
};

@Injectable()
export class EnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(enquirerId: string, data: CreateDto) {
    if (data.targetType === 'PROPERTY' && !data.propertyId) {
      throw new BadRequestException('propertyId is required for a PROPERTY enquiry');
    }
    if (data.targetType === 'LAND' && !data.landId) {
      throw new BadRequestException('landId is required for a LAND enquiry');
    }
    return this.prisma.enquiry.create({
      data: {
        enquirerId,
        targetType: data.targetType,
        propertyId: data.targetType === 'PROPERTY' ? data.propertyId : null,
        landId: data.targetType === 'LAND' ? data.landId : null,
        message: data.message,
      },
    });
  }

  // Enquiries on listings owned by this user (Property Seller or Land Owner).
  findReceived(userId: string) {
    return this.prisma.enquiry.findMany({
      where: {
        OR: [
          { property: { seller: { userId } } },
          { land: { owner: { userId } } },
        ],
      },
      include: {
        enquirer: { select: { name: true, phone: true } },
        property: { select: { id: true, title: true } },
        land: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, userId: string, status: EnquiryStatus) {
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id },
      include: {
        property: { select: { seller: { select: { userId: true } } } },
        land: { select: { owner: { select: { userId: true } } } },
      },
    });
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    const ownerId = enquiry.property?.seller.userId ?? enquiry.land?.owner.userId;
    if (ownerId !== userId) throw new ForbiddenException();
    return this.prisma.enquiry.update({ where: { id }, data: { status } });
  }
}
