import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contractor, ContractorSpecialty } from './contractor.entity';
import { CreateContractorDto } from './dto/create-contractor.dto';

@Injectable()
export class ContractorsService {
  constructor(
    @InjectRepository(Contractor)
    private readonly repo: Repository<Contractor>,
  ) {}

  async create(dto: CreateContractorDto, userId: string): Promise<Contractor> {
    const contractor = this.repo.create({ ...dto, userId });
    return this.repo.save(contractor);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    specialty?: ContractorSpecialty;
    city?: string;
    search?: string;
    available?: boolean;
  }) {
    const { page = 1, limit = 20, specialty, city, search, available } = query;

    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'user')
      .orderBy('c.rating', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (specialty) qb.andWhere('c.specialty = :specialty', { specialty });
    if (city) qb.andWhere('LOWER(c.city) = LOWER(:city)', { city });
    if (available !== undefined) qb.andWhere('c.isAvailable = :available', { available });
    if (search) {
      qb.andWhere('(LOWER(c.businessName) LIKE LOWER(:s) OR LOWER(c.bio) LIKE LOWER(:s))', { s: `%${search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Contractor> {
    const contractor = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!contractor) throw new NotFoundException('Contractor not found');
    return contractor;
  }

  async findByUserId(userId: string): Promise<Contractor | null> {
    return this.repo.findOne({ where: { userId }, relations: ['user'] });
  }

  async update(id: string, updates: Partial<Contractor>): Promise<Contractor> {
    await this.repo.update(id, updates);
    return this.findById(id);
  }
}
