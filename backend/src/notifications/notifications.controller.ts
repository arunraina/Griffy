import {
  Controller, Get, Param, Patch, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.svc.findByUser(req.user.id, page, limit);
  }

  @Get('unread-count')
  async unreadCount(@Request() req: any) {
    const count = await this.svc.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch('read-all')
  markAllRead(@Request() req: any) {
    return this.svc.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req: any) {
    return this.svc.markRead(id, req.user.id);
  }
}
