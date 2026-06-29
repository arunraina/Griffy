import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromSupabase(supabaseId: string, email: string): Promise<User> {
    return this.prisma.user.upsert({
      where: { supabaseId },
      create: { supabaseId, email, name: email.split('@')[0] },
      update: {},
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: string, data: Partial<Pick<User, 'name' | 'phone' | 'avatarUrl' | 'role'>>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
}
