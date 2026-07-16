import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TurnkeyProjectType } from '@prisma/client';

type CreateProjectInput = {
  providerId: string;
  type: TurnkeyProjectType;
  title: string;
  description: string;
  budget: number;
  targetEndDate?: string;
};

type PostUpdateInput = { note: string; percentComplete: number; imageUrls?: string[] };
type ProposeMilestoneInput = { title: string; description?: string; amount: number; sequence: number };

@Injectable()
export class TurnkeyProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(customerId: string, data: CreateProjectInput) {
    if (data.providerId === customerId) {
      throw new BadRequestException('Cannot request a turnkey project with yourself as the provider');
    }
    const provider = await this.prisma.user.findUnique({ where: { id: data.providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    const project = await this.prisma.turnkeyProject.create({
      data: {
        customerId,
        providerId: data.providerId,
        type: data.type,
        title: data.title,
        description: data.description,
        budget: data.budget,
        targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
      },
    });

    await this.notifications.notify(data.providerId, 'turnkey.requested', {
      projectTitle: data.title,
      projectId: project.id,
    });

    return project;
  }

  listMine(customerId: string) {
    return this.prisma.turnkeyProject.findMany({
      where: { customerId },
      include: { provider: { select: { name: true, avatarUrl: true } }, _count: { select: { milestones: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAssigned(providerId: string) {
    return this.prisma.turnkeyProject.findMany({
      where: { providerId },
      include: { customer: { select: { name: true, avatarUrl: true } }, _count: { select: { milestones: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.turnkeyProject.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, avatarUrl: true } },
        provider: { select: { name: true, avatarUrl: true } },
        milestones: { orderBy: { sequence: 'asc' } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.customerId !== userId && project.providerId !== userId) {
      throw new ForbiddenException('Not a participant in this project');
    }
    return project;
  }

  private async assertParticipant(id: string, userId: string) {
    const project = await this.prisma.turnkeyProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.customerId !== userId && project.providerId !== userId) {
      throw new ForbiddenException('Not a participant in this project');
    }
    return project;
  }

  async accept(id: string, providerId: string) {
    const project = await this.prisma.turnkeyProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.providerId !== providerId) throw new ForbiddenException('Only the assigned provider can accept this project');
    if (project.status !== 'REQUESTED') throw new BadRequestException('This project has already been responded to');

    const updated = await this.prisma.turnkeyProject.update({ where: { id }, data: { status: 'ACCEPTED', startDate: new Date() } });
    await this.notifications.notify(project.customerId, 'project.accepted', { projectId: id, projectTitle: project.title });
    return updated;
  }

  async decline(id: string, providerId: string) {
    const project = await this.prisma.turnkeyProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.providerId !== providerId) throw new ForbiddenException('Only the assigned provider can decline this project');
    if (project.status !== 'REQUESTED') throw new BadRequestException('This project has already been responded to');

    return this.prisma.turnkeyProject.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async markCompleted(id: string, userId: string) {
    const project = await this.assertParticipant(id, userId);
    if (project.status !== 'IN_PROGRESS' && project.status !== 'ACCEPTED') {
      throw new BadRequestException('Only an active project can be marked completed');
    }
    return this.prisma.turnkeyProject.update({ where: { id }, data: { status: 'COMPLETED', percentComplete: 100 } });
  }

  async cancel(id: string, userId: string) {
    const project = await this.assertParticipant(id, userId);
    if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
      throw new BadRequestException('This project is already finished');
    }
    return this.prisma.turnkeyProject.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async postUpdate(projectId: string, providerId: string, data: PostUpdateInput) {
    const project = await this.prisma.turnkeyProject.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.providerId !== providerId) throw new ForbiddenException('Only the assigned provider can post updates');
    if (project.status !== 'ACCEPTED' && project.status !== 'IN_PROGRESS') {
      throw new BadRequestException('This project is not active');
    }

    const update = await this.prisma.turnkeyProjectUpdate.create({
      data: { projectId, note: data.note, percentComplete: data.percentComplete, imageUrls: data.imageUrls ?? [] },
    });

    await this.prisma.turnkeyProject.update({
      where: { id: projectId },
      data: { percentComplete: data.percentComplete, status: project.status === 'ACCEPTED' ? 'IN_PROGRESS' : project.status },
    });

    await this.notifications.notify(project.customerId, 'project.update_posted', {
      percent: data.percentComplete,
      projectId,
      projectTitle: project.title,
    });

    return update;
  }

  async listUpdates(projectId: string, userId: string) {
    await this.assertParticipant(projectId, userId);
    return this.prisma.turnkeyProjectUpdate.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  }

  // ── Milestones ─────────────────────────────────────────────────────────

  async proposeMilestone(projectId: string, providerId: string, data: ProposeMilestoneInput) {
    const project = await this.prisma.turnkeyProject.findUnique({
      where: { id: projectId },
      include: { milestones: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.providerId !== providerId) throw new ForbiddenException('Only the assigned provider can propose milestones');

    const existingTotal = project.milestones.reduce((sum, m) => sum + Number(m.amount), 0);
    if (existingTotal + data.amount > Number(project.budget)) {
      throw new BadRequestException(
        `Milestone total (₹${(existingTotal + data.amount).toLocaleString('en-IN')}) would exceed the project budget of ₹${Number(project.budget).toLocaleString('en-IN')}.`,
      );
    }

    return this.prisma.turnkeyMilestone.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        sequence: data.sequence,
      },
    });
  }

  async listMilestones(projectId: string, userId: string) {
    await this.assertParticipant(projectId, userId);
    return this.prisma.turnkeyMilestone.findMany({ where: { projectId }, orderBy: { sequence: 'asc' } });
  }

  private async getMilestoneWithProject(milestoneId: string) {
    const milestone = await this.prisma.turnkeyMilestone.findUnique({
      where: { id: milestoneId },
      include: { project: true },
    });
    if (!milestone) throw new NotFoundException('Milestone not found');
    return milestone;
  }

  async submitMilestone(milestoneId: string, providerId: string) {
    const milestone = await this.getMilestoneWithProject(milestoneId);
    if (milestone.project.providerId !== providerId) throw new ForbiddenException('Only the assigned provider can submit this milestone');
    if (milestone.status !== 'PENDING' && milestone.status !== 'CHANGES_REQUESTED') {
      throw new BadRequestException('This milestone is not awaiting submission');
    }

    const updated = await this.prisma.turnkeyMilestone.update({
      where: { id: milestoneId },
      data: { status: 'SUBMITTED', changesRequestedNote: null },
    });
    await this.notifications.notify(milestone.project.customerId, 'milestone.submitted', {
      projectId: milestone.projectId,
      milestoneTitle: milestone.title,
    });
    return updated;
  }

  async approveMilestone(milestoneId: string, customerId: string) {
    const milestone = await this.getMilestoneWithProject(milestoneId);
    if (milestone.project.customerId !== customerId) throw new ForbiddenException('Only the project owner can approve this milestone');
    if (milestone.status !== 'SUBMITTED') throw new BadRequestException('This milestone has not been submitted for review');

    const updated = await this.prisma.turnkeyMilestone.update({ where: { id: milestoneId }, data: { status: 'APPROVED' } });
    await this.notifications.notify(milestone.project.providerId!, 'milestone.approved', {
      projectId: milestone.projectId,
      milestoneTitle: milestone.title,
    });
    return updated;
  }

  async requestMilestoneChanges(milestoneId: string, customerId: string, note: string) {
    const milestone = await this.getMilestoneWithProject(milestoneId);
    if (milestone.project.customerId !== customerId) throw new ForbiddenException('Only the project owner can request changes');
    if (milestone.status !== 'SUBMITTED') throw new BadRequestException('This milestone has not been submitted for review');

    const updated = await this.prisma.turnkeyMilestone.update({
      where: { id: milestoneId },
      data: { status: 'CHANGES_REQUESTED', changesRequestedNote: note },
    });
    await this.notifications.notify(milestone.project.providerId!, 'milestone.changes_requested', {
      projectId: milestone.projectId,
      milestoneTitle: milestone.title,
      note,
    });
    return updated;
  }

  // ── Payment integration (called from PaymentsService) ───────────────────

  async assertMilestoneReadyForPayment(milestoneId: string) {
    const milestone = await this.getMilestoneWithProject(milestoneId);
    if (milestone.status !== 'APPROVED') {
      throw new BadRequestException('This milestone must be approved before it can be paid');
    }
    if (milestone.paymentStatus === 'PAID') {
      throw new BadRequestException('This milestone has already been paid');
    }
    if (!milestone.project.providerId) {
      throw new BadRequestException('This project has no assigned provider');
    }

    const kyc = await this.prisma.kycDetail.findUnique({ where: { userId: milestone.project.providerId } });
    if (!kyc || kyc.status !== 'VERIFIED') {
      throw new BadRequestException(
        'The provider\'s identity and bank details have not been verified yet — payment cannot be released until KYC is complete.',
      );
    }

    return milestone;
  }

  async markMilestonePaid(milestoneId: string, razorpayPaymentId: string) {
    const milestone = await this.prisma.turnkeyMilestone.findUnique({ where: { id: milestoneId }, include: { project: true } });
    if (!milestone || milestone.paymentStatus === 'PAID') return milestone;

    const updated = await this.prisma.turnkeyMilestone.update({
      where: { id: milestoneId },
      data: { paymentStatus: 'PAID', razorpayPaymentId },
    });
    await this.notifications.notify(milestone.project.providerId!, 'milestone.paid', {
      projectId: milestone.projectId,
      milestoneTitle: milestone.title,
      amountRupees: Number(milestone.amount).toFixed(2),
    });
    return updated;
  }

  async markMilestonePaymentFailed(milestoneId: string) {
    const milestone = await this.prisma.turnkeyMilestone.findUnique({ where: { id: milestoneId }, include: { project: true } });
    if (!milestone) return;
    await this.prisma.turnkeyMilestone.update({ where: { id: milestoneId }, data: { paymentStatus: 'FAILED' } });
    await this.notifications.notify(milestone.project.customerId, 'milestone.payment_failed', {
      milestoneTitle: milestone.title,
      projectId: milestone.projectId,
    });
  }

  async setMilestoneRazorpayOrder(milestoneId: string, razorpayOrderId: string) {
    return this.prisma.turnkeyMilestone.update({ where: { id: milestoneId }, data: { razorpayOrderId } });
  }

  findMilestoneByRazorpayOrderId(razorpayOrderId: string) {
    return this.prisma.turnkeyMilestone.findFirst({ where: { razorpayOrderId } });
  }
}
