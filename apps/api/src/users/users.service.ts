import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(
    id: string,
    data: Partial<Pick<User, 'name' | 'phone' | 'avatarUrl'>>,
  ): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  setRole(id: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }
}
