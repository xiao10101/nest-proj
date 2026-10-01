import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { BusinessException } from '@/common/filters/business.exception.js';
import { LoginDto } from '@/common/dtos/user.dto.js';
import { PrismaService } from '@/shared/prisma/prisma.service.js';
import { RedisService } from '@/redis/redis.service.js';
import { Logger } from 'nestjs-pino';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly jwt: JwtService,
  ) {}

  async login({ phone, code }: LoginDto) {
    const phoneKey = this.codeKey(phone);
    const codeInCache = await this.redis.get(phoneKey);
    if (!codeInCache || codeInCache !== code) {
      throw new BusinessException(100000, '验证码错误或已过期');
    }
    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {}, // 已存在就原样用
      create: { phone }, // 不存在就建
    });
    this.redis.delete(phoneKey);
    return {
      token: this.jwt.sign({
        sub: user.id,
      }),
    };
  }

  private codeKey(phone: string) {
    return `auth:code:${phone}`;
  }

  async getCode(phone: string) {
    const phoneKey = this.codeKey(phone);
    // const lockKey = this.lockKey(phone);
    const codeInCache = await this.redis.get(phoneKey);
    if (codeInCache) {
      throw new BusinessException(100000, '验证码已发送，请稍勿重复发送');
    }
    const code = randomInt(100000, 999999);
    this.redis.set(phoneKey, code.toString(), 300);
    // this.redis.set(lockKey, '1', 60);
    this.logger.debug({ phone, code }, '测试验证码');
  }
}
