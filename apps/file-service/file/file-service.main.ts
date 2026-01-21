import { NestFactory } from '@nestjs/core';
import { FileModule } from './file-service.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('FileService');
  const configService = new ConfigService();
  const host = configService.get<string>('FILE_SERVICE_HOST') || '0.0.0.0';
  const port = Number(configService.get('FILE_SERVICE_PORT') || 3002);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
    },
  );

  await app.listen();
  logger.log(`✅ File Service microservice is running on TCP ${host}:${port}`);
}
void bootstrap();
