import { NestFactory } from '@nestjs/core';
import { JobsServiceModule } from './jobs-service.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const config = new ConfigService();
  const brokers = config.get<string>('KAFKA_BROKERS') || 'localhost:9092';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    JobsServiceModule,
    {
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
    },
  );

  await app.listen();
  console.log('Jobs Service Kafka microservice is running');
}

void bootstrap();
