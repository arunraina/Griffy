import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './project.entity';
import { Bid } from './bid.entity';
import { Contractor } from '../contractors/contractor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Bid, Contractor])],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
