import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.material.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      include: { seller: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { seller: { select: { id: true, name: true } } },
    });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  create(sellerId: string, data: { name: string; description?: string | null; price: number; unit: string; stock: number; imageUrl?: string | null }) {
    return this.prisma.material.create({ data: { ...data, sellerId } });
  }

  update(id: string, data: { name?: string; description?: string | null; price?: number; unit?: string; stock?: number; imageUrl?: string | null }) {
    return this.prisma.material.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.material.delete({ where: { id } });
  }
}
