import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, UserRole } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

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

  create(
    customerId: string,
    data: { providerId: string; providerRole: UserRole; scheduledAt: Date; notes?: string; amount: number },
  ) {
    return this.prisma.booking.create({ data: { customerId, ...data } });
  }

  async updateStatus(id: string, status: BookingStatus, userId?: string, razorpayPaymentId?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (userId && booking.providerId !== userId && booking.customerId !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status, ...(razorpayPaymentId && { razorpayPaymentId }) },
    });
  }
}
