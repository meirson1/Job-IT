import { NestFactory } from '@nestjs/core';
import { FileModule } from './file-service.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(FileModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('FILE_SERVICE_PORT');
  console.log(`File Service is running on: http://localhost:${port}`);
}
void bootstrap();
