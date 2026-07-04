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
    const booking = await this.prisma.booking.create({ data: { customerId, ...data } });
    await this.notifications.create(
      data.providerId,
      'BOOKING_CREATED',
      'New booking request',
      `You have a new booking request for ${data.scheduledAt.toLocaleDateString('en-IN')}.`,
      '/dashboard',
    );
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

    if (status === 'CONFIRMED' || status === 'CANCELLED') {
      await this.notifications.create(
        booking.customerId,
        status === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED',
        status === 'CONFIRMED' ? 'Booking confirmed' : 'Booking cancelled',
        status === 'CONFIRMED'
          ? 'Your booking has been confirmed by the provider.'
          : 'Your booking has been cancelled.',
        '/dashboard',
      );
    }

    return updated;
  }
}
