import { RedisService } from '@/redis/redis.service.js';
import { RequestContextService } from '@/shared/context/request-context.service.js';
import { PrismaService } from '@/shared/prisma/prisma.service.js';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class HealthService implements OnApplicationShutdown {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly ctx: RequestContextService,
  ) {}

  async checkDB(): Promise<'up' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch (e) {
      return 'down';
    }
  }

  async checkRedis(): Promise<'up' | 'down'> {
    try {
      await this.redis.ping();
      return 'up';
    } catch (e) {
      return 'down';
    }
  }

  async check() {
    const res = await this.checkDB();
    const redisRes = await this.checkRedis();
    return {
      requestId: this.ctx.get()?.requestId,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      // TODO: 阶段 2 实现
      checks: {
        db: res,
        redis: redisRes,
      },
    };
  }

  onApplicationShutdown(signal?: string) {
    // pino transport 跑在 worker 线程，进程退出时在途日志可能丢失；
    // 关停路径的日志必须可靠，故用同步的 console。
    console.warn(`shutting down, signal: ${signal}`);
  }

  async slow(ms: string) {
    const duration = Math.min(Math.max(Number(ms) || 0, 0), 10000); // 想想为什么要 clamp
    await new Promise((resolve) => setTimeout(resolve, duration));
    return { slow: true, waitedMs: duration };
  }
}
