import { NestFactory } from '@nestjs/core';
import { JobsServiceModule } from './jobs-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(JobsServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.JOB_SERVICE_PORT) || 3003;
  await app.listen(port, '0.0.0.0');

  console.log(`Jobs Service is running on: http://localhost:${port}`);
}
void bootstrap();
