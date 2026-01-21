import { NestFactory } from '@nestjs/core';
import { JobsServiceModule } from './jobs-service.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('JobsService');
  const config = new ConfigService();
  const brokers = config.get<string>('KAFKA_BROKERS') || 'localhost:9092';
  const port = config.get<number>('JOB_PORT') || 3003;
  const app = await NestFactory.create(JobsServiceModule);
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'jobs-service',
        brokers: [brokers],
      },
      consumer: {
        groupId: 'jobs-service-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');
  logger.log(`✅ Jobs Service microservice is running on port ${port}`);
}

void bootstrap();
