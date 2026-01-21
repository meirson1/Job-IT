import { NestFactory } from '@nestjs/core';
import { FileModule } from './file-service.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const configService = new ConfigService();
  const port = Number(configService.get('FILE_PORT') || 3002);
  const app = await NestFactory.create(FileModule);

  await app.listen(port, '0.0.0.0');
  console.log(`File Service is running as HTTP app on port: ${port}`);
}
void bootstrap();
