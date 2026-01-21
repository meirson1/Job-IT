import { NestFactory } from '@nestjs/core';
import { IndexerModule } from './indexer-service.module.js';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const config = new ConfigService();
  const brokers = config.get<string>('KAFKA_BROKERS') || 'localhost:9092';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IndexerModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'indexer',
          brokers: [brokers],
        },
        consumer: {
          groupId: 'indexer-consumer',
        },
      },
    },
  );

  await app.listen();
  console.log('Indexer Service microservice is running');
}

void bootstrap();
