import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobUpsertedEventDto, JobDeletedEventDto } from '@app/shared';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);

  onModuleInit() {
    this.logger.log('✅ IndexerService initialized');
  }

  deleteJob(data: JobDeletedEventDto) {
    this.logger.log(`Deleting job: ${JSON.stringify(data)}`);
  }

  indexJob(data: JobUpsertedEventDto) {
    this.logger.log(`Indexing job: ${JSON.stringify(data)}`);
  }
}
