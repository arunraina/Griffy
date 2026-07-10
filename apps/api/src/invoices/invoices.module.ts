import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
