import { Module } from '@nestjs/common';
import { MaterialSupplierProfilesController } from './material-supplier-profiles.controller';
import { MaterialSupplierProfilesService } from './material-supplier-profiles.service';

@Module({
  controllers: [MaterialSupplierProfilesController],
  providers: [MaterialSupplierProfilesService],
  exports: [MaterialSupplierProfilesService],
})
export class MaterialSupplierProfilesModule {}
