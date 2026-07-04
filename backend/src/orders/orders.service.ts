import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';
import { Material } from '../materials/material.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly repo: Repository<Order>,
    @InjectRepository(Contractor) private readonly contractorRepo: Repository<Contractor>,
    @InjectRepository(Labour) private readonly labourRepo: Repository<Labour>,
    @InjectRepository(Material) private readonly materialRepo: Repository<Material>,
  ) {}

  async create(dto: CreateOrderDto, buyerId: string): Promise<Order> {
    const platformFee = Number(dto.amount) * 0.05;
    const order = this.repo.create({ ...dto, buyerId, platformFee });
    return this.repo.save(order);
  }

  async findForUser(buyerId: string, page = 1, limit = 10) {
    const [data, total] = await this.repo.findAndCount({
      where: { buyerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Order> {
    const order = await this.repo.findOne({ where: { id }, relations: ['buyer'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.repo.update(id, { status });
    return this.findById(id);
  }

  async findIncomingForUser(userId: string, role: string, page = 1, limit = 20) {
    let itemIds: string[] = [];

    if (role === 'contractor') {
      const profile = await this.contractorRepo.findOne({ where: { userId }, select: ['id'] });
      if (profile) itemIds = [profile.id];
    } else if (role === 'labour') {
      const profile = await this.labourRepo.findOne({ where: { userId }, select: ['id'] });
      if (profile) itemIds = [profile.id];
    } else if (role === 'supplier') {
      const mats = await this.materialRepo.find({ where: { supplierId: userId }, select: ['id'] });
      itemIds = mats.map((m) => m.id);
    }

    if (itemIds.length === 0) return { data: [], total: 0, page, limit };

    const [data, total] = await this.repo.findAndCount({
      where: { itemId: In(itemIds) },
      relations: ['buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async releaseEscrow(id: string): Promise<Order> {
    await this.repo.update(id, { isEscrowReleased: true, status: OrderStatus.COMPLETED });
    return this.findById(id);
  }
}
