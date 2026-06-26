import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
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

  async releaseEscrow(id: string): Promise<Order> {
    await this.repo.update(id, { isEscrowReleased: true, status: OrderStatus.COMPLETED });
    return this.findById(id);
  }
}
