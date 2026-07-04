import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateDto = {
  name: string;
  description?: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  stock: number;
  imageUrls?: string[];
};

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string, category?: string, subcategory?: string) {
    return this.prisma.material.findMany({
      where: {
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(category ? { category } : {}),
        ...(subcategory ? { subcategory } : {}),
      },
      include: {
        supplier: { select: { businessName: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, businessName: true, user: { select: { name: true } } } },
      },
    });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async create(userId: string, data: CreateDto) {
    const supplier = await this.prisma.materialSupplierProfile.findUnique({ where: { userId } });
    if (!supplier) throw new ForbiddenException('No supplier profile found');
    if (supplier.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException('Supplier profile is not yet approved');
    }
    return this.prisma.material.create({ data: { ...data, supplierId: supplier.id } });
  }

  async update(id: string, userId: string, data: Partial<CreateDto>) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { supplier: { select: { userId: true } } },
    });
    if (!material) throw new NotFoundException('Material not found');
    if (material.supplier.userId !== userId) throw new ForbiddenException();
    return this.prisma.material.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { supplier: { select: { userId: true } } },
    });
    if (!material) throw new NotFoundException('Material not found');
    if (material.supplier.userId !== userId) throw new ForbiddenException();
    return this.prisma.material.delete({ where: { id } });
  }
}
