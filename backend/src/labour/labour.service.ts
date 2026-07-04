import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Labour, LabourTrade } from './labour.entity';
import { CreateLabourDto } from './dto/create-labour.dto';

@Injectable()
export class LabourService {
  constructor(
    @InjectRepository(Labour)
    private readonly repo: Repository<Labour>,
  ) {}

  async create(dto: CreateLabourDto, userId: string): Promise<Labour> {
    const labour = this.repo.create({ ...dto, userId });
    return this.repo.save(labour);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    trade?: LabourTrade;
    city?: string;
    search?: string;
    available?: boolean;
    maxRate?: number;
  }) {
    const { page = 1, limit = 20, trade, city, search, available, maxRate } = query;

    const qb = this.repo.createQueryBuilder('l')
      .leftJoinAndSelect('l.user', 'user')
      .orderBy('l.rating', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (trade) qb.andWhere('l.trade = :trade', { trade });
    if (city) qb.andWhere('LOWER(l.city) = LOWER(:city)', { city });
    if (available !== undefined) qb.andWhere('l.isAvailable = :available', { available });
    if (maxRate) qb.andWhere('l.dailyRate <= :maxRate', { maxRate });
    if (search) {
      qb.andWhere('LOWER(l.bio) LIKE LOWER(:s)', { s: `%${search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Labour> {
    const labour = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!labour) throw new NotFoundException('Labour not found');
    return labour;
  }

  async findByUserId(userId: string): Promise<Labour | null> {
    return this.repo.findOne({ where: { userId }, relations: ['user'] });
  }

  async update(id: string, updates: Partial<Labour>): Promise<Labour> {
    await this.repo.update(id, updates);
    return this.findById(id);
  }
}
