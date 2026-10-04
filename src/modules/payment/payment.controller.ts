import { Body, Controller, Headers, Post } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { Public } from '@/common/decorators/public.decorator.js';
import { PaymentCallbackDto } from './dto/callback.dto.js';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from '@/common/filters/business.exception.js';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly config: ConfigService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('callback')
  @Public()
  async callback(
    @Headers('x-pay-sign') sign: string,
    @Body() dto: PaymentCallbackDto,
  ) {
    const signKey = this.config.get('payment.signKey');
    if (sign !== signKey) {
      throw new BusinessException(40101, '签名校验失败');
    }
    return this.paymentService.callback(dto);
  }
}
