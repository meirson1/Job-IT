import { NestFactory } from '@nestjs/core';
import { FileModule } from './file-service.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const configService = new ConfigService();
  const port = Number(configService.get('FILE_PORT') || 3002);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: port,
      },
    },
  );
  await app.listen();
  console.log(`File Service is running as TCP microservice on port: ${port}`);
}
void bootstrap();
