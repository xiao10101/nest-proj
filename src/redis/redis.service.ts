import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { REDIS_CLIENT } from './redis.provider.js';
import type { RedisClient } from './redis.provider.js';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    private readonly logger: Logger,
  ) {}
  async onModuleDestroy() {
    this.redis.quit();
  }
  async onModuleInit() {
    try {
      await this.redis.connect();
    } catch (e) {
      this.logger.error(e);
      process.exit(1);
    }
  }

  set(key: string, value: string, ttlSec?: number) {
    return ttlSec
      ? this.redis.set(key, value, 'EX', ttlSec)
      : this.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async delete(key: string) {
    return await this.redis.del(key);
  }
}
