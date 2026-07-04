import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedItem, SavedItemType } from './saved-item.entity';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedItem) private readonly repo: Repository<SavedItem>,
  ) {}

  async save(userId: string, type: SavedItemType, targetId: string): Promise<SavedItem> {
    const existing = await this.repo.findOne({ where: { userId, type, targetId } });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ userId, type, targetId }));
  }

  async unsave(userId: string, type: SavedItemType, targetId: string): Promise<void> {
    await this.repo.delete({ userId, type, targetId });
  }

  async findAll(userId: string, type?: SavedItemType) {
    const where: any = { userId };
    if (type) where.type = type;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async isSaved(userId: string, type: SavedItemType, targetId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, type, targetId } });
    return count > 0;
  }

  async getBulkStatus(userId: string, items: { type: SavedItemType; targetId: string }[]): Promise<Record<string, boolean>> {
    const saved = await this.repo.find({ where: items.map((i) => ({ userId, type: i.type, targetId: i.targetId })) as any });
    const result: Record<string, boolean> = {};
    for (const item of items) result[`${item.type}:${item.targetId}`] = false;
    for (const s of saved) result[`${s.type}:${s.targetId}`] = true;
    return result;
  }
}
