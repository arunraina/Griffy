import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedItem } from './saved-item.entity';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SavedItem])],
  providers: [SavedService],
  controllers: [SavedController],
  exports: [SavedService],
})
export class SavedModule {}
