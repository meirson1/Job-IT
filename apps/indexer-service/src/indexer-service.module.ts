import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IndexerController } from './indexer-service.controller.js';
import { IndexerService } from './indexer-service.service.js';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { PrismaModule } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ElasticsearchModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  controllers: [IndexerController],
  providers: [IndexerService],
})
export class IndexerModule {}
