import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
// import { ConfigService } from '@nestjs/config';

const data = 1

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.setGlobalPrefix('api/v1')
  // port = app.get(ConfigService).get('app.port')
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
