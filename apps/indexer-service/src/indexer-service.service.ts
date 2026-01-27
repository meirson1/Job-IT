import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  JobUpsertedEventDto,
  JobDeletedEventDto,
  JOB_INDEX,
  JOB_INDEX_MAPPING,
} from '@app/shared';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private readonly MAX_RETRIES = 3;

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    this.logger.log('✅ IndexerService initialized');
    await this.checkMapping();
  }

  async checkMapping() {
    const indexExists = await this.elasticsearchService.indices.exists({
      index: JOB_INDEX,
    });

    const exists = Boolean(indexExists);

    if (!exists) {
      this.logger.log('Mapping not found, creating...');
      await this.elasticsearchService.indices.create({
        index: JOB_INDEX,
        mappings: JOB_INDEX_MAPPING,
      });
      this.logger.log(`✅ Created "${JOB_INDEX}" index with mapping`);
    }
  }

  async deleteJob(event: JobDeletedEventDto) {
    this.logger.log(`Deleting job: ${JSON.stringify(event)}`);
    try {
      await this.elasticsearchService.delete({
        index: JOB_INDEX,
        id: event.jobId.toString(),
      });
      this.logger.log(`✅ Successfully deleted job ${event.jobId}`);
    } catch (error) {
      const err = error as { statusCode?: number; message: string };

      if (err.statusCode === 404) {
        this.logger.log(
          `Job ${event.jobId} already deleted from Elasticsearch`,
        );
        return;
      }

      this.logger.error(`Failed to delete job ${event.jobId}: ${err.message}`);
    }
  }

  async indexJob(event: JobUpsertedEventDto, retryCount = 0): Promise<void> {
    this.logger.log(`Indexing job: ${JSON.stringify(event)}`);
    try {
      const document = this.mapEventToDocument(event);

      await this.elasticsearchService.index({
        index: JOB_INDEX,
        id: event.jobId.toString(),
        document,
      });

      this.logger.log(
        `✅ Successfully indexed job ${event.jobId} (${event.operation})`,
      );
    } catch (error) {
      const err = error as Error;

      if (retryCount < this.MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000;
        this.logger.warn(
          `Retry ${retryCount + 1}/${this.MAX_RETRIES} for job ${event.jobId} after ${delay}ms`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.indexJob(event, retryCount + 1);
      }

      this.logger.error(
        `❌ Failed to index job ${event.jobId} after ${this.MAX_RETRIES} retries: ${err.message}`,
      );
    }
  }

  private mapEventToDocument(event: JobUpsertedEventDto) {
    return {
      title: event.title,
      description: event.description,
      location: event.location,
      companyName: event.companyName ?? null,

      salaryMin: event.salaryMin ?? null,
      salaryMax: event.salaryMax ?? null,
      salaryCurrency: event.salaryCurrency ?? null,

      promoted: event.promoted ?? false,
      source: event.source,
      url: event.url ?? null,

      role: event.role ?? null,

      requirements: event.requirements,
      responsibilities: event.responsibilities,
      benefits: event.benefits ?? null,

      workplaceType: event.workplaceType,
      employmentType: event.employmentType,
      experienceLevel: event.experienceLevel,

      externalId: event.externalId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
