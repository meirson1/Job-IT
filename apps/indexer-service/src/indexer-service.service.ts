import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobUpsertedEventDto, JobDeletedEventDto } from '@app/shared';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  onModuleInit() {
    this.logger.log('✅ IndexerService initialized');
  }

  async deleteJob(data: JobDeletedEventDto) {
    this.logger.log(`Deleting job: ${JSON.stringify(data)}`);
    try {
      await this.elasticsearchService.delete({
        index: 'jobs',
        id: data.id.toString(),
      });
      this.logger.log(`Successfully deleted job ${data.id}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to delete job ${data.id}: ${err.message}`);
    }
  }

  async indexJob(data: JobUpsertedEventDto) {
    this.logger.log(`Indexing job: ${JSON.stringify(data)}`);
    try {
      await this.elasticsearchService.index({
        index: 'jobs',
        id: data.id.toString(),
        document: data,
      });
      this.logger.log(`Successfully indexed job ${data.id}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to index job ${data.id}: ${err.message}`);
    }
  }
}
