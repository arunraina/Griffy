import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EarlyAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, interest?: string) {
    try {
      return await this.prisma.earlyAccessSignup.create({ data: { email, interest } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This email is already on the list');
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.earlyAccessSignup.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
