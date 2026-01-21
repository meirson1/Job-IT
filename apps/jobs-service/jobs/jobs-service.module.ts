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
        name: 'JOB_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'job',
              brokers: [configService.get('KAFKA_BROKERS') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'job-consumer',
            },
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
