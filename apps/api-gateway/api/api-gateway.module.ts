import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FilesController } from './files.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
      {
        name: 'FILE_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: Number(configService.get('FILE_PORT')),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [JobsController, FilesController],
  providers: [],
})
export class ApiGatewayModule {}
