import { Module } from '@nestjs/common';
import { TurnkeyProjectsController } from './turnkey-projects.controller';
import { TurnkeyProjectsService } from './turnkey-projects.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [TurnkeyProjectsController],
  providers: [TurnkeyProjectsService],
  exports: [TurnkeyProjectsService],
})
export class TurnkeyProjectsModule {}
