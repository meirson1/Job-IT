import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobsController } from './jobs-service.controller';
import { JobsService } from './jobs-service.service';
import { PrismaModule } from '@app/database';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'jobs-service',
              brokers: (
                config.get<string>('KAFKA_BROKERS') ?? 'localhost:9092'
              ).split(','),
            },
            producerOnly: true,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsServiceModule {}
