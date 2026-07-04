import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';
import { Material } from '../materials/material.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly repo: Repository<Order>,
    @InjectRepository(Contractor) private readonly contractorRepo: Repository<Contractor>,
    @InjectRepository(Labour) private readonly labourRepo: Repository<Labour>,
    @InjectRepository(Material) private readonly materialRepo: Repository<Material>,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateOrderDto, buyerId: string): Promise<Order> {
    const platformFee = Number(dto.amount) * 0.05;
    const order = this.repo.create({ ...dto, buyerId, platformFee });
    const saved = await this.repo.save(order);

    // Notify the seller
    let sellerId: string | undefined;
    if (dto.type === 'contractor') {
      const c = await this.contractorRepo.findOne({ where: { id: dto.itemId } });
      sellerId = c?.userId;
    } else if (dto.type === 'labour') {
      const l = await this.labourRepo.findOne({ where: { id: dto.itemId } });
      sellerId = l?.userId;
    } else if (dto.type === 'material') {
      const m = await this.materialRepo.findOne({ where: { id: dto.itemId } });
      sellerId = m?.supplierId;
    }
    if (sellerId) {
      this.notifications.create({
        userId: sellerId,
        type: 'order_placed',
        title: 'New order received',
        body: 'You have a new order. Check your dashboard to confirm it.',
        link: '/dashboard',
      }).catch(() => undefined);
    }

    return saved;
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
    const order = await this.findById(id);
    const statusLabels: Record<string, string> = {
      accepted: 'accepted ✅', in_progress: 'in progress 🔨', completed: 'completed 🎉', cancelled: 'cancelled',
    };
    this.notifications.create({
      userId: order.buyerId,
      type: 'order_status',
      title: 'Order status updated',
      body: `Your order is now ${statusLabels[status] ?? status}. View details in My Orders.`,
      link: '/orders',
    }).catch(() => undefined);
    return order;
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
