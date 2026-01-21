import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  deleteJob(data: unknown) {
    this.logger.log(`Deleting job: ${JSON.stringify(data)}`);
  }

  indexJob(data: unknown) {
    this.logger.log(`Indexing job: ${JSON.stringify(data)}`);
  }
}
