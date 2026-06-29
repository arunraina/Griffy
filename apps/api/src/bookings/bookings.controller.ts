import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { BookingsService } from './bookings.service';
import { BookingStatus, User } from '@prisma/client';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  findMy(@CurrentUser() user: User) {
    return this.bookings.findByCustomer(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookings.findOne(id);
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() body: { serviceProviderId: string; scheduledAt: string; notes?: string; amount: number },
  ) {
    return this.bookings.create(user.id, {
      ...body,
      scheduledAt: new Date(body.scheduledAt),
    });
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: BookingStatus },
  ) {
    return this.bookings.updateStatus(id, body.status);
  }
}
