import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  findByCustomer(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: { serviceProvider: { include: { user: { select: { name: true } } } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  findByServiceProvider(serviceProviderId: string) {
    return this.prisma.booking.findMany({
      where: { serviceProviderId },
      include: { customer: { select: { name: true, phone: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { customer: true, serviceProvider: { include: { user: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  create(customerId: string, data: { serviceProviderId: string; scheduledAt: Date; notes?: string; amount: number }) {
    return this.prisma.booking.create({
      data: { customerId, ...data },
    });
  }

  updateStatus(id: string, status: BookingStatus, razorpayPaymentId?: string) {
    return this.prisma.booking.update({
      where: { id },
      data: { status, ...(razorpayPaymentId && { razorpayPaymentId }) },
    });
  }
}
