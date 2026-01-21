import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);

  onModuleInit() {
    this.logger.log('✅ IndexerService initialized');
  }

  deleteJob(data: unknown) {
    this.logger.log(`Deleting job: ${JSON.stringify(data)}`);
  }

  indexJob(data: unknown) {
    this.logger.log(`Indexing job: ${JSON.stringify(data)}`);
  }
}
