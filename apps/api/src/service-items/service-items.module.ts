import { Module } from '@nestjs/common';
import { ServiceItemsController } from './service-items.controller';
import { ServiceItemsService } from './service-items.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ServiceItemsController],
  providers: [ServiceItemsService],
  exports: [ServiceItemsService],
})
export class ServiceItemsModule {}
