import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const SLOW_QUERY_THRESHOLD_MS = 1000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
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

    // Prisma 5's $use is deprecated in favor of $extends but still supported
    // -- fine here since this is a v5-only project. Only logs; never alters
    // the query or its result, so it can't change behavior.
    this.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;
      if (duration > SLOW_QUERY_THRESHOLD_MS) {
        this.logger.warn(`Slow query: ${params.model}.${params.action} took ${duration}ms`);
      }
      return result;
    });
  }

  async onModuleDestroy() {
    if (this.replicaClient) await this.replicaClient.$disconnect();
  }
}
