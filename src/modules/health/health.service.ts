import { RequestContextService } from '@/shared/context/request-context.service.js';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class HealthService implements OnApplicationShutdown {
  constructor(
    @InjectPinoLogger(HealthService.name)
    private readonly logger: PinoLogger,
    private readonly ctx: RequestContextService,
  ) {}
  async check() {
    await new Promise((r) => setImmediate(r));
    this.logger.debug('health checked');
    return {
      requestId: this.ctx.get()?.requestId,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      // TODO: 阶段 2 实现
      checks: {
        db: null,
        redis: null,
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
    // TODO: await 一个 setTimeout 包成的 Promise
    await new Promise(() => setTimeout(() => {}, duration));
    return { slow: true, waitedMs: duration };
  }
}
