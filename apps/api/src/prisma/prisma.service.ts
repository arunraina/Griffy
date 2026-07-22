import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Unset in every environment today -- `read` resolves to `this` (the
  // primary connection), so nothing changes until a read replica is
  // actually provisioned and DATABASE_READ_URL is set. At that point,
  // read-only call sites can switch from `this.prisma.x.findMany(...)`
  // to `this.prisma.read.x.findMany(...)` to route off the primary.
  private replicaClient: PrismaClient | null = null;

  get read(): PrismaClient {
    const url = process.env.DATABASE_READ_URL;
    if (!url) return this;
    if (!this.replicaClient) {
      this.replicaClient = new PrismaClient({ datasources: { db: { url } } });
    }
    return this.replicaClient;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    if (this.replicaClient) await this.replicaClient.$disconnect();
  }
}
