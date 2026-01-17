import { NestFactory } from '@nestjs/core';
import { JobsServiceModule } from './jobs-service.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(JobsServiceModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('JOB_SERVICE_PORT') || 3001;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);

  console.log(`Jobs Service is running on: http://localhost:${port}`);
}
void bootstrap();
