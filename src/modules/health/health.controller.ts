import { Controller, Get, Query } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { BusinessException } from '@/common/filters/business.exception.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return this.healthService.check();
  }

  @Get('slow')
  async slow(@Query('ms') ms: string) {
    return await this.healthService.slow(ms);
  }

  @Get('boom')
  boom() {
    throw new BusinessException(40001, '这是一次受控爆炸');
  }

  @Get('error')
  error() {
    throw new Error('这是一次未受控爆炸');
  }
}
