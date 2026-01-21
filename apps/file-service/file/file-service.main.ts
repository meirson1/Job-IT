import { NestFactory } from '@nestjs/core';
import { FileModule } from './file-service.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const configService = new ConfigService();
  const port = Number(configService.get('FILE_PORT') || 3002);
  const app = await NestFactory.create(FileModule);
  app.enableCors();

  await app.listen(port, '0.0.0.0');
  Logger.log(`✅ File Service is running as HTTP app on port: ${port}`);
}
void bootstrap();
