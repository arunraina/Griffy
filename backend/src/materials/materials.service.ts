import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Material, MaterialCategory } from './material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly repo: Repository<Material>,
  ) {}

  async create(dto: CreateMaterialDto, supplierId: string): Promise<Material> {
    const material = this.repo.create({ ...dto, supplierId });
    return this.repo.save(material);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: MaterialCategory;
    city?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) {
    const { page = 1, limit = 20, category, city, search, minPrice, maxPrice, sortBy } = query;

    const qb = this.repo.createQueryBuilder('m')
      .where('m.isAvailable = true')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) qb.andWhere('m.category = :category', { category });
    if (city) qb.andWhere('LOWER(m.city) = LOWER(:city)', { city });
    if (search) qb.andWhere('LOWER(m.name) LIKE LOWER(:search)', { search: `%${search}%` });
    if (minPrice) qb.andWhere('m.pricePerUnit >= :minPrice', { minPrice });
    if (maxPrice) qb.andWhere('m.pricePerUnit <= :maxPrice', { maxPrice });

    if (sortBy === 'price_asc') {
      qb.orderBy('m.pricePerUnit', 'ASC');
    } else if (sortBy === 'price_desc') {
      qb.orderBy('m.pricePerUnit', 'DESC');
    } else if (sortBy === 'rating') {
      qb.orderBy('m.rating', 'DESC');
    } else if (sortBy === 'newest') {
      qb.orderBy('m.createdAt', 'DESC');
    } else {
      qb.orderBy('m.isFeatured', 'DESC').addOrderBy('m.rating', 'DESC');
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Material> {
    const material = await this.repo.findOne({ where: { id }, relations: ['supplier'] });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async findBySupplier(supplierId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { supplierId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async update(id: string, updates: Partial<Material>): Promise<Material> {
    await this.repo.update(id, updates);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
