import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListProductsQuery } from './dto/list-products.query.js';
import { PrismaService } from '@/shared/prisma/prisma.service.js';
import type { Prisma } from '@/generated/prisma/client.js';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

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

    return { items, hasMore, nextCursor };
  }

  async detail(id: number) {
    const detail = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
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

    if (!detail) {
      throw new NotFoundException(`商品 ${id} 不存在`);
    }

    return detail;
  }
}
