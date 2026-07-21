import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceItemDto, UpdateServiceItemDto, ServiceItemProfileType } from './dto/service-item.dto';

const MAX_ITEMS_PER_PROFILE = 40;

@Injectable()
export class ServiceItemsService {
  constructor(private readonly prisma: PrismaService) {}

  list(profileType: string, profileId: string) {
    return this.prisma.serviceItem.findMany({
      where: { profileType, profileId, active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateServiceItemDto) {
    const profileId = await this.resolveOwnProfileId(dto.profileType, userId);

    const count = await this.prisma.serviceItem.count({ where: { profileType: dto.profileType, profileId } });
    if (count >= MAX_ITEMS_PER_PROFILE) {
      throw new BadRequestException(`Maximum of ${MAX_ITEMS_PER_PROFILE} service items reached.`);
    }

    return this.prisma.serviceItem.create({
      data: {
        profileType: dto.profileType,
        profileId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        priceUnit: dto.priceUnit,
        category: dto.category,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateServiceItemDto) {
    const item = await this.prisma.serviceItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Service item not found');
    await this.assertOwnership(item.profileType, item.profileId, userId);

    return this.prisma.serviceItem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.priceUnit !== undefined && { priceUnit: dto.priceUnit }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.serviceItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Service item not found');
    await this.assertOwnership(item.profileType, item.profileId, userId);
    await this.prisma.serviceItem.delete({ where: { id } });
    return { success: true };
  }

  // Same "resolve server-side, never trust client-supplied profileId" pattern
  // as PortfolioService — a user can only ever add to their OWN profile here.
  private async resolveOwnProfileId(profileType: ServiceItemProfileType, userId: string): Promise<string> {
    const profile = await this.getProfileByUser(profileType, userId);
    if (!profile) throw new NotFoundException(`You don't have a ${profileType} profile yet.`);
    return profile.id;
  }

  private async assertOwnership(profileType: string, profileId: string, userId: string): Promise<void> {
    const profile = await this.getProfileById(profileType, profileId);
    if (!profile || profile.userId !== userId) throw new ForbiddenException('You do not own this service item');
  }

  private getProfileByUser(profileType: string, userId: string) {
    switch (profileType) {
      case 'service-expert': return this.prisma.serviceExpertProfile.findUnique({ where: { userId } });
      case 'labour': return this.prisma.labourProfile.findUnique({ where: { userId } });
      default: throw new BadRequestException('Invalid profile type');
    }
  }

  private getProfileById(profileType: string, profileId: string) {
    switch (profileType) {
      case 'service-expert': return this.prisma.serviceExpertProfile.findUnique({ where: { id: profileId } });
      case 'labour': return this.prisma.labourProfile.findUnique({ where: { id: profileId } });
      default: throw new BadRequestException('Invalid profile type');
    }
  }
}
