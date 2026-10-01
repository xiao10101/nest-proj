import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export type RedisClient = Redis;

export const redisProvider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): RedisClient =>
    new Redis({
      host: config.get('redis.host'),
      port: config.get('redis.port'),
      db: config.get('redis.db'),
      retryStrategy: (times: number) => Math.min(times * 200, 5000),
      maxRetriesPerRequest: config.get('redis.maxRetriesPerRequest'),
      lazyConnect: config.get('redis.lazyConnect'),
    }),
};
