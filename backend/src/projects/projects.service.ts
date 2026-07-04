import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus, ProjectType } from './project.entity';
import { Bid, BidStatus } from './bid.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { Contractor } from '../contractors/contractor.entity';
import { getContactInfoViolation } from '../common/utils/content-moderation';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Contractor) private readonly contractorRepo: Repository<Contractor>,
  ) {}

  async create(dto: CreateProjectDto, homeownerId: string): Promise<Project> {
    const project = this.projectRepo.create({ ...dto, homeownerId });
    return this.projectRepo.save(project);
  }

  async findAll(query: {
    page?: number; limit?: number;
    projectType?: ProjectType; city?: string; search?: string;
  }) {
    const { page = 1, limit = 12, projectType, city, search } = query;

    const qb = this.projectRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.homeowner', 'homeowner')
      .where('p.status = :status', { status: ProjectStatus.OPEN })
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (projectType) qb.andWhere('p.projectType = :projectType', { projectType });
    if (city) qb.andWhere('LOWER(p.city) LIKE LOWER(:city)', { city: `%${city}%` });
    if (search) qb.andWhere('LOWER(p.title) LIKE LOWER(:s) OR LOWER(p.description) LIKE LOWER(:s)', { s: `%${search}%` });

    const [data, total] = await qb.getManyAndCount();

    const ids = data.map((p) => p.id);
    const bidCounts: { projectId: string; count: string }[] = ids.length
      ? await this.bidRepo
          .createQueryBuilder('b')
          .select('b.projectId', 'projectId')
          .addSelect('COUNT(*)', 'count')
          .where('b.projectId IN (:...ids)', { ids })
          .groupBy('b.projectId')
          .getRawMany()
      : [];
    const countMap = Object.fromEntries(bidCounts.map((r) => [r.projectId, Number(r.count)]));

    const enriched = data.map((p) => ({ ...p, bidCount: countMap[p.id] ?? 0 }));
    return { data: enriched, total, page, limit };
  }

  async findByHomeowner(homeownerId: string, page = 1, limit = 20) {
    const qb = this.projectRepo.createQueryBuilder('p')
      .where('p.homeownerId = :homeownerId', { homeownerId })
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    const ids = data.map((p) => p.id);
    const bidCounts: { projectId: string; count: string }[] = ids.length
      ? await this.bidRepo
          .createQueryBuilder('b')
          .select('b.projectId', 'projectId')
          .addSelect('COUNT(*)', 'count')
          .where('b.projectId IN (:...ids)', { ids })
          .groupBy('b.projectId')
          .getRawMany()
      : [];
    const countMap = Object.fromEntries(bidCounts.map((r) => [r.projectId, Number(r.count)]));

    return { data: data.map((p) => ({ ...p, bidCount: countMap[p.id] ?? 0 })), total, page, limit };
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({ where: { id }, relations: ['homeowner'] });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async close(id: string, userId: string): Promise<Project> {
    const project = await this.findById(id);
    if (project.homeownerId !== userId) throw new ForbiddenException();
    project.status = ProjectStatus.CLOSED;
    return this.projectRepo.save(project);
  }

  async createBid(projectId: string, dto: CreateBidDto, userId: string): Promise<Bid> {
    const project = await this.findById(projectId);
    if (project.status !== ProjectStatus.OPEN) throw new BadRequestException('Project is no longer accepting bids');

    const contractor = await this.contractorRepo.findOne({ where: { userId } });
    if (!contractor) throw new BadRequestException('You must have a contractor profile to bid');

    const existing = await this.bidRepo.findOne({ where: { projectId, contractorId: contractor.id } });
    if (existing) throw new BadRequestException('You already submitted a bid for this project');

    const violation = getContactInfoViolation(dto.message);
    if (violation) {
      throw new BadRequestException(
        `Sharing ${violation}s is not allowed. Keep conversations on Griffy for your protection.`,
      );
    }

    const bid = this.bidRepo.create({ projectId, contractorId: contractor.id, ...dto });
    return this.bidRepo.save(bid);
  }

  async findBids(projectId: string, requesterId: string): Promise<Bid[]> {
    const project = await this.findById(projectId);
    if (project.homeownerId !== requesterId) throw new ForbiddenException('Only the project owner can view bids');
    return this.bidRepo.find({
      where: { projectId },
      relations: ['contractor', 'contractor.user'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateBidStatus(projectId: string, bidId: string, status: BidStatus, userId: string): Promise<Bid> {
    const project = await this.findById(projectId);
    if (project.homeownerId !== userId) throw new ForbiddenException();

    const bid = await this.bidRepo.findOne({ where: { id: bidId, projectId } });
    if (!bid) throw new NotFoundException('Bid not found');

    bid.status = status;
    const saved = await this.bidRepo.save(bid);

    if (status === BidStatus.AWARDED) {
      await this.projectRepo.update(projectId, { status: ProjectStatus.AWARDED });
    }
    return saved;
  }
}
