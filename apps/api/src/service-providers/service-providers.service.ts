import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceProvider } from '@prisma/client';

export interface ServiceProviderFilters {
  category?: string;
  location?: string;
  isVerified?: boolean;
}

@Injectable()
export class ServiceProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: ServiceProviderFilters = {}) {
    return this.prisma.serviceProvider.findMany({
      where: {
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: { contains: filters.location, mode: 'insensitive' } }),
        ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
      },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { rating: 'desc' },
    });
  }

  async findOne(id: string) {
    const sp = await this.prisma.serviceProvider.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!sp) throw new NotFoundException('Service provider not found');
    return sp;
  }

  create(userId: string, data: { category: string; description?: string | null; location: string }) {
    return this.prisma.serviceProvider.create({
      data: { ...data, userId },
    });
  }

  update(id: string, data: Partial<Pick<ServiceProvider, 'category' | 'description' | 'location'>>) {
    return this.prisma.serviceProvider.update({ where: { id }, data });
  }
}
