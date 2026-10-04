import { PrismaService } from '@/shared/prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { BusinessException } from '@/common/filters/business.exception.js';
import { generateOrderNo } from './order-no.util.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
    return await this.prisma.$transaction(async (tx) => {
      const sku = await tx.sku.findUnique({
        where: { id: dto.skuId },
        include: { product: true, inventory: true },
      });
      if (!sku) throw new BusinessException(40004, `SKU ${dto.skuId} 不存在`);
      if (sku.product.status !== 'ON_SALE') {
        throw new BusinessException(40010, '商品已下架');
      }
      if (!sku.inventory) {
        throw new BusinessException(40011, '库存不存在');
      }
      if (sku.inventory.available < dto.quantity) {
        throw new BusinessException(40020, '库存不足');
      }
      await tx.inventory.update({
        where: { id: sku.inventory.id },
        data: {
          available: { decrement: dto.quantity },
          locked: { increment: dto.quantity },
        },
      });
      const order = await tx.order.create({
        data: {
          userId,
          orderNo: generateOrderNo(),
          totalAmount: dto.quantity * sku.price,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          skuId: sku.id,
          skuName: sku.product.name + sku.spec,
          price: sku.price,
          quantity: dto.quantity,
          subtotal: dto.quantity * sku.price,
        },
      });

      return {
        id: order.id,
        orderNo: order.orderNo,
        totalAmount: order.totalAmount,
      };
    });
  }
}
