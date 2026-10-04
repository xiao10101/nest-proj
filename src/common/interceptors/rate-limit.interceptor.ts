import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator.js';
import { Reflector } from '@nestjs/core';
import { RedisService } from '@/redis/redis.service.js';

@Injectable()
export class RateLimitIntercrceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const config = this.reflector.getAllAndOverride<{
      limit: number;
      windowSec: number;
    }>(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
    if (!config) return next.handle();
    const req = context.switchToHttp().getRequest();
    const ip = req.ip ?? 'unkonwn';
    const key = `ratelimit:${ip}:${req.route?.path ?? req.url}`;

    const count = await this.redis.hitWindow(key, config.windowSec);
    if (count > config.limit) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return next.handle();
  }
}
