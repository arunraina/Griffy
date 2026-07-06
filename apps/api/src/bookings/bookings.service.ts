import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findByCustomer(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: {
        provider: { select: { id: true, name: true, avatarUrl: true, phone: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  findByProvider(providerId: string) {
    return this.prisma.booking.findMany({
      where: { providerId },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true } },
        provider: { select: { name: true, avatarUrl: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(
    customerId: string,
    data: { providerId: string; providerRole: UserRole; scheduledAt: Date; notes?: string; amount: number },
  ) {
    const [booking, customer] = await Promise.all([
      this.prisma.booking.create({ data: { customerId, ...data } }),
      this.prisma.user.findUnique({ where: { id: customerId }, select: { name: true } }),
    ]);
    await this.notifications.notify(data.providerId, 'booking.created', { customerName: customer?.name ?? 'a customer' });
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus, userId?: string, razorpayPaymentId?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (userId && booking.providerId !== userId && booking.customerId !== userId) {
      throw new ForbiddenException();
    }
    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status, ...(razorpayPaymentId && { razorpayPaymentId }) },
    });

    if (status === 'CONFIRMED') {
      await this.notifications.notify(booking.customerId, 'booking.confirmed', {});
    }

    if (status === 'CANCELLED') {
      const otherParty = userId === booking.customerId ? booking.providerId : booking.customerId;
      await this.notifications.notify(otherParty, 'booking.cancelled', {});
    }

    if (status === 'COMPLETED') {
      await this.notifications.notify(booking.customerId, 'booking.completed', {});
      await this.incrementCompletedJobs(booking.providerId, booking.providerRole);
    }

    return updated;
  }

  private async incrementCompletedJobs(providerId: string, providerRole: UserRole) {
    if (providerRole === 'CONTRACTOR') {
      await this.prisma.contractorProfile.updateMany({
        where: { userId: providerId },
        data: { totalJobs: { increment: 1 } },
      });
    } else if (providerRole === 'LABOUR') {
      await this.prisma.labourProfile.updateMany({
        where: { userId: providerId },
        data: { totalJobs: { increment: 1 } },
      });
    } else if (providerRole === 'SERVICE_EXPERT') {
      await this.prisma.serviceExpertProfile.updateMany({
        where: { userId: providerId },
        data: { totalJobs: { increment: 1 } },
      });
    }
  }
}
