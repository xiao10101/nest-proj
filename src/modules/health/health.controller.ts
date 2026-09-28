import { Controller, Get, Query } from '@nestjs/common';
import { HealthService } from './health.service.js';

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
}
