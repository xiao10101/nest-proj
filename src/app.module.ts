import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './config/validation.schema.js';
import { configuration } from './config/configuration.js';
import { RequestContextService } from './shared/context/request-context.service.js';
// modules
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './modules/health/health.module.js';
import { AuthMoudle } from './modules/auth/auth.module.js';
import { RedisModule } from './redis/redis.module.js';
import { PrismaModule } from './shared/prisma/prisma.module.js';
// interceptors
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
// filters
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { flattenValidationErrors } from './common/pipes/flatten-validation-errors.js';
// guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';

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
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthMoudle,
  ],
  providers: [
    RequestContextService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        // 静默剥离——多余字段被删掉
        whitelist: true,
        // // 硬报错——发现多余字段直接抛 400
        // forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) =>
          new BadRequestException(flattenValidationErrors(errors)),
      }),
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
