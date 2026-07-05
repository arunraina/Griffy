import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BidStatus } from '@prisma/client';
import { detectContactInfo } from './contact-info.util';

type CreateProjectDto = {
  projectType: string;
  title: string;
  description: string;
  city: string;
  state: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
};

type SubmitBidDto = { bidAmount: number; message: string };

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findOpen(projectType?: string) {
    return this.prisma.project.findMany({
      where: { status: 'OPEN', isHidden: false, ...(projectType ? { projectType } : {}) },
      include: { _count: { select: { bids: true } } },
      orderBy: [{ isDemoted: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { owner: { select: { name: true } }, _count: { select: { bids: true } } },
    });
    if (!project || project.isHidden) throw new NotFoundException('Project not found');
    return project;
  }

  create(ownerId: string, data: CreateProjectDto) {
    return this.prisma.project.create({ data: { ownerId, ...data } });
  }

  async findBids(projectId: string, requesterId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== requesterId) throw new ForbiddenException('Only the project owner can view bids');
    return this.prisma.bid.findMany({
      where: { projectId },
      include: { contractor: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async submitBid(projectId: string, contractorId: string, data: SubmitBidDto) {
    const flagged = detectContactInfo(data.message);
    if (flagged) {
      throw new BadRequestException(`Sharing a ${flagged} is not allowed. Keep conversations on Griffy for your protection.`);
    }

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status !== 'OPEN') throw new BadRequestException('This project is no longer accepting bids');
    if (project.ownerId === contractorId) throw new ForbiddenException('You cannot bid on your own project');

    const existing = await this.prisma.bid.findUnique({
      where: { projectId_contractorId: { projectId, contractorId } },
    });
    if (existing) throw new ConflictException('You have already bid on this project');

    const bid = await this.prisma.bid.create({
      data: { projectId, contractorId, bidAmount: data.bidAmount, message: data.message },
    });

    await this.notifications.create(
      project.ownerId,
      'PROJECT_BID_RECEIVED',
      'New bid on your project',
      `You received a new bid of ₹${data.bidAmount.toLocaleString('en-IN')} on "${project.title}".`,
      `/projects/${projectId}`,
    );

    return bid;
  }

  async updateBidStatus(projectId: string, bidId: string, ownerId: string, status: BidStatus) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== ownerId) throw new ForbiddenException('Only the project owner can update bids');

    const bid = await this.prisma.bid.findUnique({ where: { id: bidId } });
    if (!bid || bid.projectId !== projectId) throw new NotFoundException('Bid not found');

    const updated = await this.prisma.bid.update({ where: { id: bidId }, data: { status } });

    if (status === 'ACCEPTED') {
      await this.prisma.project.update({ where: { id: projectId }, data: { status: 'AWARDED' } });
    }

    await this.notifications.create(
      bid.contractorId,
      status === 'ACCEPTED' ? 'PROJECT_BID_ACCEPTED' : 'PROJECT_BID_REJECTED',
      status === 'ACCEPTED' ? 'Bid accepted!' : 'Bid update',
      status === 'ACCEPTED'
        ? `Your bid on "${project.title}" was accepted.`
        : `Your bid on "${project.title}" was not selected this time.`,
      `/projects/${projectId}`,
    );

    return updated;
  }
}
