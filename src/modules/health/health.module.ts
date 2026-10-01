import { Module } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthController } from './health.controller.js';
import { RequestContextService } from '@/shared/context/request-context.service.js';

@Module({
  controllers: [HealthController],
  providers: [HealthService, RequestContextService],
})
export class HealthModule {}
