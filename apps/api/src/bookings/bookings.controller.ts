import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { BookingsService } from './bookings.service';
import { BookingStatus, User, UserRole } from '@prisma/client';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('my')
  findMy(@CurrentUser() user: User) {
    return this.bookings.findByCustomer(user.id);
  }

  @Get('incoming')
  findIncoming(@CurrentUser() user: User) {
    return this.bookings.findByProvider(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookings.findOne(id);
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body()
    body: {
      providerId: string;
      providerRole: UserRole;
      scheduledAt: string;
      notes?: string;
      amount?: number;
    },
  ) {
    return this.bookings.create(user.id, {
      providerId:   body.providerId,
      providerRole: body.providerRole,
      scheduledAt:  new Date(body.scheduledAt),
      notes:        body.notes,
      amount:       body.amount ?? 0,
    });
  }

  @Patch(':id/confirm')
  confirm(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookings.updateStatus(id, BookingStatus.CONFIRMED, user.id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookings.updateStatus(id, BookingStatus.CANCELLED, user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { status: BookingStatus },
  ) {
    return this.bookings.updateStatus(id, body.status, user.id);
  }
}
