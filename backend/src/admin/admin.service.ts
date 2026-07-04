import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Contractor } from '../contractors/contractor.entity';
import { Material } from '../materials/material.entity';
import { Order } from '../orders/order.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Contractor) private readonly contractors: Repository<Contractor>,
    @InjectRepository(Material) private readonly materials: Repository<Material>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async getStats() {
    const [totalUsers, totalOrders, totalContractors, pendingVerifications] = await Promise.all([
      this.users.count(),
      this.orders.count(),
      this.contractors.count(),
      this.contractors.count({ where: { isVerified: false } }),
    ]);

    const revenueResult = await this.orders
      .createQueryBuilder('o')
      .select('SUM(o.platformFee)', 'revenue')
      .getRawOne();

    return {
      totalUsers,
      totalOrders,
      totalContractors,
      pendingVerifications,
      platformRevenue: Number(revenueResult?.revenue ?? 0),
    };
  }

  async listUsers(page = 1, limit = 20, search?: string) {
    const qb = this.users.createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (search) qb.where('LOWER(u.fullName) LIKE LOWER(:s) OR LOWER(u.email) LIKE LOWER(:s)', { s: `%${search}%` });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async updateUser(id: string, updates: { isActive?: boolean; role?: string }) {
    await this.users.update(id, updates);
    return this.users.findOne({ where: { id } });
  }

  async listContractors(page = 1, limit = 20, verified?: boolean) {
    const qb = this.contractors.createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'user')
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (verified !== undefined) qb.where('c.isVerified = :verified', { verified });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async verifyContractor(id: string) {
    await this.contractors.update(id, { isVerified: true });
    return this.contractors.findOne({ where: { id }, relations: ['user'] });
  }

  async listMaterials(page = 1, limit = 20) {
    const [data, total] = await this.materials.findAndCount({
      relations: ['supplier'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async toggleFeatured(id: string) {
    const material = await this.materials.findOne({ where: { id } });
    if (!material) return null;
    await this.materials.update(id, { isFeatured: !material.isFeatured });
    return this.materials.findOne({ where: { id }, relations: ['supplier'] });
  }

  async listOrders(page = 1, limit = 20) {
    const [data, total] = await this.orders.findAndCount({
      relations: ['buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
