import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validationSchema } from './config/validation.schema.js';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'nestjs-proj',
    }),
    ConfigModule.forRoot({
      validationSchema
    }),
    HealthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
