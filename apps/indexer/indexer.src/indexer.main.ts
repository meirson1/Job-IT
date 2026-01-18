import { NestFactory } from '@nestjs/core';
import { IndexerModule } from './indexer.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(IndexerModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('INDEXER_SERVICE_PORT') || 3004;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);

  console.log(`Indexer Service is running on: http://localhost:${port}`);
}
void bootstrap();
