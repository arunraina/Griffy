import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

// Lifts TEMP_SUSPENDED accounts back to ACTIVE once their expiry passes.
// Runs hourly rather than on a tighter schedule since suspension durations
// are measured in days, not minutes -- no user is meaningfully harmed by a
// restoration landing up to an hour late.
@Injectable()
export class AccountStatusExpiryCron {
  private readonly logger = new Logger(AccountStatusExpiryCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async liftExpiredSuspensions() {
    const expired = await this.prisma.user.findMany({
      where: { accountStatus: 'TEMP_SUSPENDED', statusExpiresAt: { lte: new Date() } },
      select: { id: true, statusUpdatedById: true },
    });

    for (const { id, statusUpdatedById } of expired) {
      // changedById is required (there's always an admin who imposed the
      // original suspension); attribute the auto-restore to them, and let
      // the reason text ("expired") make clear this was automatic, not a
      // second manual action on their part.
      const changedById = statusUpdatedById ?? id;

      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: {
            accountStatus: 'ACTIVE',
            statusReason: null,
            statusExpiresAt: null,
            statusUpdatedAt: new Date(),
            isSuspended: false,
          },
        });
        await tx.userStatusHistory.create({
          data: {
            userId: id,
            previousStatus: 'TEMP_SUSPENDED',
            newStatus: 'ACTIVE',
            reason: 'Temporary suspension expired',
            changedById,
          },
        });
        return user;
      });

      await this.notifications.notify(id, 'account.status_changed', { status: 'ACTIVE' });
    }

    if (expired.length > 0) {
      this.logger.log(`Auto-restored ${expired.length} expired temp-suspended account(s)`);
    }
  }
}
