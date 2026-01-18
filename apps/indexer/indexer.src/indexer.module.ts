import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerController } from './indexer.controller.js';
import { IndexerService } from './indexer.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [IndexerController],
  providers: [IndexerService],
})
export class IndexerModule {}
