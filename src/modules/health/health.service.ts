import { RequestContextService } from '@/shared/context/request-context.service.js';
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class HealthService {
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
}
