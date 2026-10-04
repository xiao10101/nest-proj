import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListProductsQuery } from './dto/list-products.query.js';
import { PrismaService } from '@/shared/prisma/prisma.service.js';
import type { Prisma, ProductStatus } from '@/generated/prisma/client.js';
import { RedisService } from '@/redis/redis.service.js';
import { Logger } from 'nestjs-pino';
import { randomInt } from 'node:crypto';

@Injectable()
export class ProductService {
  constructor(
    private readonly redis: RedisService,
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
  ) {}

  private detailKey = (id: number) => `product:detail:${id}`;

  private listVerKey = () => 'product:list:ver';

  private listKey(ver: number, limit: number, status?: ProductStatus) {
    return `product:list:v${ver}:${status ?? 'ALL'}:${limit}`;
  }

  private parseCursor(cursor?: string) {
    if (!cursor) return null;
    if (!/^\d+_\d+$/.test(cursor)) {
      throw new BadRequestException('cursor 格式非法');
    }
    const [t, id] = cursor.split('_');
    return { t: new Date(Number(t)), id: Number(id) };
  }

  async list(query: ListProductsQuery) {
    const limit = query.limit ?? 10;
    const ver = Number(await this.redis.get(this.listVerKey())) ?? 0;
    const key = this.listKey(ver, limit, query.status);
    const cached = await this.redis.get(key);
    if (cached) {
      this.logger.debug({ key }, '商品列表: 缓存命中');
      return JSON.parse(cached);
    }
    const where: Prisma.ProductWhereInput = {};
    const cursorData = this.parseCursor(query.cursor);
    cursorData
      ? (where.OR = [
          { createdAt: { lt: cursorData.t } }, // 更早的
          {
            createdAt: { equals: cursorData.t },
            id: { lt: cursorData.id },
          }, // 同一秒里更靠前的
        ])
      : (where.OR = undefined);

    if (query.status) {
      where.status = query.status;
    }

    const rows = await this.prisma.product.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;

    const items = hasMore ? rows.slice(0, limit) : rows;

    const nextCursor = hasMore
      ? `${items[limit - 1].createdAt.getTime()}_${items[limit - 1].id}`
      : null;

    if (!cursorData) {
      await this.redis.set(
        key,
        JSON.stringify({ items, hasMore, nextCursor }),
        60,
      );
      this.logger.debug({ key }, '商品列表: 缓存未命中，已回填');
    }

    return { items, hasMore, nextCursor };
  }

  private async queryProduct(id: number, key: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
        skus: {
          select: {
            id: true,
            spec: true,
            price: true,
            inventory: {
              select: { available: true },
            },
          },
        },
      },
    });

    if (!product) {
      await this.redis.set(key, 'NULL', 60);
      throw new NotFoundException(`商品 ${id} 不存在`);
    }
    // 防止雪崩
    const ttl = 300 + randomInt(0, 61);
    await this.redis.set(key, JSON.stringify(product), ttl);
    this.logger.debug({ id }, '商品详情: 缓存未命中，已回填');

    return product;
  }

  async detail(id: number) {
    const key = this.detailKey(id);
    const cached = await this.redis.get(key);
    // 防止穿透
    if (cached === 'NULL') {
      this.logger.debug({ id }, '详情: 空值缓存命中');
      throw new NotFoundException(`商品 ${id} 不存在`);
    }
    if (cached) {
      this.logger.debug({ id }, '商品详情: 缓存命中');
      return JSON.parse(cached);
    }
    const lockKey = `product:detail:lock:${id}`;
    const acquired = await this.redis.setNx(lockKey, '1', 10);

    if (acquired === 'OK') {
      try {
        return await this.queryProduct(id, key);
      } finally {
        await this.redis.delete(lockKey);
      }
    }
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 100));
      const retry = await this.redis.get(key);
      if (retry === 'NULL') throw new NotFoundException(`商品 ${id} 不存在`);
      if (retry) return JSON.parse(retry);
    }

    return await this.queryProduct(id, key);
  }

  async updateStatus(id: number, status: ProductStatus) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) throw new NotFoundException(`商品 ${id} 不存在`);

    if (product.status === status) {
      return { id, status };
    }

    const result = await this.prisma.product.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
      },
    });
    await this.redis.delete(this.detailKey(id));
    await this.redis.incr(this.listVerKey());
    return result;
  }
}
