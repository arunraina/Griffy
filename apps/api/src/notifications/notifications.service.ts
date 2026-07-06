import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappSenderService } from './whatsapp-sender.service';
import { EmailService } from './email.service';
import { NotificationEvent, renderNotification } from './notification-templates';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly whatsapp: WhatsappSenderService,
    private readonly email: EmailService,
  ) {}

  async findByUser(userId: string, opts: { unread?: boolean; page?: number; pageSize?: number } = {}) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts.pageSize && opts.pageSize > 0 ? Math.min(opts.pageSize, 50) : 20;

    const where = { userId, channel: NotificationChannel.IN_APP, ...(opts.unread ? { isRead: false } : {}) };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, channel: NotificationChannel.IN_APP, isRead: false },
    });
    return { count };
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, channel: NotificationChannel.IN_APP, isRead: false },
      data: { isRead: true },
    });
  }

  // Central entry point — call this from anywhere an event happens
  // (bookings, orders, admin approvals, ...). Always creates an IN_APP
  // row synchronously so the bell reflects it immediately; WhatsApp/email
  // dispatch happens in the background and can never fail the caller.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async notify(userId: string, event: NotificationEvent, payload: Record<string, any> = {}): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { phone: true, email: true } });
    if (!user) return;

    const appBaseUrl = this.config.get<string>('APP_BASE_URL') ?? 'http://localhost:3000';
    const rendered = renderNotification(event, payload, appBaseUrl);

    await this.prisma.notification.create({
      data: {
        userId,
        type: event,
        title: rendered.title,
        body: rendered.body,
        linkUrl: rendered.linkUrl,
        channel: NotificationChannel.IN_APP,
      },
    });

    this.dispatchOutbound(userId, user, event, rendered).catch((err) => {
      this.logger.error(`[notifications:error] outbound dispatch failed for event "${event}": ${(err as Error).message}`);
    });
  }

  private async dispatchOutbound(
    userId: string,
    user: { phone: string | null; email: string },
    event: NotificationEvent,
    rendered: ReturnType<typeof renderNotification>,
  ): Promise<void> {
    let whatsappSent = false;

    if (user.phone) {
      try {
        await this.whatsapp.send(user.phone, rendered.whatsappText);
        whatsappSent = true;
        await this.prisma.notification.create({
          data: { userId, type: event, title: rendered.title, body: rendered.whatsappText, linkUrl: rendered.linkUrl, channel: NotificationChannel.WHATSAPP, status: 'SENT' },
        });
      } catch (err) {
        this.logger.error(`[notifications:error] WhatsApp send failed (user ${userId}, event "${event}"): ${(err as Error).message}`);
        await this.prisma.notification.create({
          data: { userId, type: event, title: rendered.title, body: rendered.whatsappText, linkUrl: rendered.linkUrl, channel: NotificationChannel.WHATSAPP, status: 'FAILED' },
        });
      }
    }

    if (!whatsappSent) {
      try {
        await this.email.send(user.email, rendered.emailSubject, {
          title: rendered.title,
          body: rendered.body,
          linkUrl: rendered.linkUrl,
        });
        await this.prisma.notification.create({
          data: { userId, type: event, title: rendered.title, body: rendered.body, linkUrl: rendered.linkUrl, channel: NotificationChannel.EMAIL, status: 'SENT' },
        });
      } catch (err) {
        this.logger.error(`[notifications:error] Email send failed (user ${userId}, event "${event}"): ${(err as Error).message}`);
        await this.prisma.notification.create({
          data: { userId, type: event, title: rendered.title, body: rendered.body, linkUrl: rendered.linkUrl, channel: NotificationChannel.EMAIL, status: 'FAILED' },
        });
      }
    }
  }
}
