import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  private generateReferralCode(name: string): string {
    const prefix = name.replace(/\s+/g, '').slice(0, 3).toUpperCase().padEnd(3, 'G');
    return prefix + randomBytes(3).toString('hex').toUpperCase();
  }

  async findByReferralCode(code: string): Promise<User | null> {
    return this.repo.findOne({ where: { referralCode: code } });
  }

  async getReferralStats(userId: string): Promise<{ code: string; referralCount: number }> {
    const user = await this.findById(userId);
    const referralCount = await this.repo.count({ where: { referredBy: userId } });
    return { code: user.referralCode ?? '', referralCount };
  }

  async create(dto: CreateUserDto): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 12);
    const referralCode = this.generateReferralCode(dto.fullName);

    let referredBy: string | undefined;
    if (dto.referralCode) {
      const referrer = await this.findByReferralCode(dto.referralCode);
      if (referrer) referredBy = referrer.id;
    }

    const user = this.repo.create({ ...dto, password: hashed, referralCode, referredBy });
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email }, select: ['id', 'email', 'password', 'role', 'fullName', 'isActive'] });
  }

  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(id: string, data: { fullName?: string; phone?: string; city?: string; state?: string }): Promise<User> {
    const allowed: (keyof User)[] = ['fullName', 'phone', 'city', 'state'];
    const safe = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k as keyof User))
    ) as Partial<User>;
    if (Object.keys(safe).length) await this.repo.update(id, safe);
    return this.findById(id);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
}
