import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto, PortfolioProfileType } from './dto/portfolio-item.dto';

const MAX_ITEMS_PER_PROFILE = 20;

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  list(profileType: string, profileId: string) {
    return this.prisma.portfolioItem.findMany({
      where: { profileType, profileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreatePortfolioItemDto) {
    const profileId = await this.resolveOwnProfileId(dto.profileType, userId);

    const count = await this.prisma.portfolioItem.count({ where: { profileType: dto.profileType, profileId } });
    if (count >= MAX_ITEMS_PER_PROFILE) {
      throw new BadRequestException(`Maximum of ${MAX_ITEMS_PER_PROFILE} portfolio items reached.`);
    }

    return this.prisma.portfolioItem.create({
      data: {
        profileType: dto.profileType,
        profileId,
        title: dto.title,
        description: dto.description,
        imageUrls: dto.imageUrls,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdatePortfolioItemDto) {
    const item = await this.prisma.portfolioItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Portfolio item not found');
    await this.assertOwnership(item.profileType, item.profileId, userId);

    return this.prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.imageUrls !== undefined && { imageUrls: dto.imageUrls }),
        ...(dto.completedAt !== undefined && { completedAt: dto.completedAt ? new Date(dto.completedAt) : null }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.portfolioItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Portfolio item not found');
    await this.assertOwnership(item.profileType, item.profileId, userId);
    await this.prisma.portfolioItem.delete({ where: { id } });
    return { success: true };
  }

  // A user can only ever add to their OWN profile of that type — profileId
  // is resolved server-side, never trusted from the client, so there's no
  // ownership gap to check on create.
  private async resolveOwnProfileId(profileType: PortfolioProfileType, userId: string): Promise<string> {
    const profile = await this.getProfileByUser(profileType, userId);
    if (!profile) throw new NotFoundException(`You don't have a ${profileType} profile yet.`);
    return profile.id;
  }

  private async assertOwnership(profileType: string, profileId: string, userId: string): Promise<void> {
    const profile = await this.getProfileById(profileType, profileId);
    if (!profile || profile.userId !== userId) throw new ForbiddenException('You do not own this portfolio item');
  }

  private getProfileByUser(profileType: string, userId: string) {
    switch (profileType) {
      case 'contractor': return this.prisma.contractorProfile.findUnique({ where: { userId } });
      case 'labour': return this.prisma.labourProfile.findUnique({ where: { userId } });
      case 'service-expert': return this.prisma.serviceExpertProfile.findUnique({ where: { userId } });
      default: throw new BadRequestException('Invalid profile type');
    }
  }

  private getProfileById(profileType: string, profileId: string) {
    switch (profileType) {
      case 'contractor': return this.prisma.contractorProfile.findUnique({ where: { id: profileId } });
      case 'labour': return this.prisma.labourProfile.findUnique({ where: { id: profileId } });
      case 'service-expert': return this.prisma.serviceExpertProfile.findUnique({ where: { id: profileId } });
      default: throw new BadRequestException('Invalid profile type');
    }
  }
}
