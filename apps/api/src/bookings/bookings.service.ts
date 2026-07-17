import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

// Transitions only the provider may trigger (they're the one doing the work).
const PROVIDER_ONLY_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING: ['CONFIRMED'],
  CONFIRMED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
};

// Transitions either party may trigger.
const EITHER_PARTY_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING: ['CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  IN_PROGRESS: ['CANCELLED'],
};

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

    // userId is only omitted for trusted internal callers (payment
    // webhook/verify) — those bypass the party/transition checks below,
    // which exist to stop a real end user from confirming/completing their
    // own booking or skipping states via the API.
    if (userId) {
      if (booking.providerId !== userId && booking.customerId !== userId) {
        throw new ForbiddenException();
      }

      const isProviderOnly = (PROVIDER_ONLY_TRANSITIONS[booking.status] ?? []).includes(status);
      const isEitherParty = (EITHER_PARTY_TRANSITIONS[booking.status] ?? []).includes(status);
      if (!isProviderOnly && !isEitherParty) {
        throw new BadRequestException(`Cannot move a booking from ${booking.status} to ${status}`);
      }
      if (isProviderOnly && userId !== booking.providerId) {
        throw new ForbiddenException('Only the provider can do that');
      }
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

  // Idempotent — called from both the Razorpay webhook and /payments/verify.
  async markPaid(bookingId: string, razorpayPaymentId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.status !== 'PENDING') return booking;
    return this.updateStatus(bookingId, 'CONFIRMED', undefined, razorpayPaymentId);
  }

  async markPaymentFailed(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return;
    await this.notifications.notify(booking.customerId, 'booking.payment_failed', {});
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
