import { PrismaService } from '@/shared/prisma/prisma.service.js';
import { Injectable } from '@nestjs/common';
import { PaymentCallbackDto } from './dto/callback.dto.js';
import { BusinessException } from '@/common/filters/business.exception.js';
import { OrderStatus, PaymentStatus } from '@/generated/prisma/enums.js';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  callback(dto: PaymentCallbackDto) {
    return this.prisma.$transaction(async (tx) => {
      const existed = await tx.payment.findUnique({
        where: {
          channelTradeNo: dto.channelTradeNo,
        },
      });
      if (existed) {
        return { idempotent: true, orderNo: dto.orderNo };
      }

      const order = await tx.order.findUnique({
        where: { orderNo: dto.orderNo },
      });
      if (!order) {
        throw new BusinessException(40404, '订单不存在');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BusinessException(
          40009,
          `订单状态为 ${order.status}，无法支付`,
        );
      }

      if (dto.amount !== order.totalAmount) {
        throw new BusinessException(40030, '回调金额与订单金额不符');
      }

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          channelTradeNo: dto.channelTradeNo,
          amount: dto.amount,
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
      });

      const item = await tx.orderItem.findFirst({
        where: { orderId: order.id },
      });
      await tx.inventory.update({
        where: { skuId: item!.skuId },
        data: { locked: { decrement: item!.quantity } },
      });

      return {
        paymentId: payment.id,
        orderNo: order.orderNo,
        status: OrderStatus.PAID,
      };
    });
  }
}
