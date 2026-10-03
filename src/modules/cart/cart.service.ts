import { BusinessException } from '@/common/filters/business.exception.js';
import { PrismaService } from '@/shared/prisma/prisma.service.js';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number) {
    return await this.prisma.cartItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        quantity: true,
        sku: {
          select: {
            id: true,
            spec: true,
            price: true,
            product: {
              select: { id: true, name: true },
            },
            inventory: {
              select: { available: true },
            },
          },
        },
      },
    });
  }

  async addItem(userId: number, skuId: number, quantity: number) {
    const sku = await this.prisma.sku.findUnique({
      where: { id: skuId },
    });
    if (!sku) {
      throw new BusinessException(40004, `SKU ${skuId} 不存在`);
    }
    return await this.prisma.cartItem.upsert({
      where: {
        userId_skuId: {
          userId,
          skuId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        skuId,
        quantity,
      },
    });
  }

  async updateQuantity(userId: number, itemId: number, quantity: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException(`购物车项${itemId}不存在`);
    if (item.userId !== userId)
      throw new ForbiddenException(`购物车项${itemId}不属于当前用户`);
    return await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
      },
    });
  }

  async deleteItem(userId: number, itemId: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException(`购物车项${itemId}不存在`);
    if (item.userId !== userId)
      throw new ForbiddenException(`购物车项${itemId}不属于当前用户`);
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }
}
