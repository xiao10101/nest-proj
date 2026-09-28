import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validationSchema } from './config/validation.schema.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './modules/health/health.module.js';
import { configuration } from './config/configuration.js';
import { RequestContextService } from './shared/context/request-context.service.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      isGlobal: true,
      load: [configuration],
      cache: true,
      envFilePath: [`.env.${process.env.STAGE}`, '.env'],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('app.logLevel') ?? 'info',
          redact: {
            paths: ['req.headers.authorization'],
            censor: '**REDACTED**',
          },
          transport:
            process.env.NODE_ENV !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
                    singleLine: true,
                  },
                }
              : undefined,
          autoLogging: {
            ignore: (req) => req.url?.startsWith('/api/v1/health') ?? false,
          },
        },
      }),
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RequestContextService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
})
export class AppModule {}
