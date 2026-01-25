import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobUpsertedEventDto, JobDeletedEventDto } from '@app/shared';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService, Job } from '@app/database';

const JOB_INDEX = 'jobs';

const JOB_INDEX_MAPPING = {
  properties: {
    title: { type: 'text' },
    description: { type: 'text' },
    location: { type: 'text' },

    companyName: {
      type: 'text',
      fields: { keyword: { type: 'keyword' } },
    },

    salaryMin: { type: 'integer' },
    salaryMax: { type: 'integer' },
    salaryCurrency: { type: 'keyword' },

    promoted: { type: 'boolean' },
    source: { type: 'keyword' },
    url: { type: 'keyword', ignore_above: 2048 },

    role: { type: 'keyword' },

    requirements: { type: 'text' },
    responsibilities: { type: 'text' },
    benefits: { type: 'text' },

    workplaceType: { type: 'keyword' },
    employmentType: { type: 'keyword' },
    experienceLevel: { type: 'keyword' },

    externalId: { type: 'keyword' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
} as const;

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('✅ IndexerService initialized');
    await this.checkMapping();
  }

  async checkMapping() {
    const indexExists = await this.elasticsearchService.indices.exists({
      index: JOB_INDEX,
    });

    const exists =
      typeof indexExists === 'boolean'
        ? indexExists
        : ((indexExists as unknown as { valueOf: () => boolean }).valueOf?.() ??
          indexExists);

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
      this.logger.log(`Successfully deleted job ${event.jobId}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to delete job ${event.jobId}: ${err.message}`);
    }
  }

  async indexJob(event: JobUpsertedEventDto) {
    this.logger.log(`Indexing job: ${JSON.stringify(event)}`);
    try {
      const job = await this.prisma.job.findUnique({
        where: {
          id: event.jobId,
        },
        include: {
          company: true,
        },
      });

      if (!job) {
        this.logger.warn(
          `Job ${event.jobId} not found in DB - skipping indexing`,
        );
        return;
      }

      const document = this.mapToDocument(job);

      await this.elasticsearchService.index({
        index: JOB_INDEX,
        id: job.id.toString(),
        document,
      });
      this.logger.log(`Successfully indexed job ${job.id}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to index job ${event.jobId}: ${err.message}`);
    }
  }

  private mapToDocument(job: Job & { company: { name: string } | null }) {
    return {
      title: job.title,
      description: job.description,
      location: job.location,
      companyName: job.company?.name ?? null,

      salaryMin: job.salaryMin ?? null,
      salaryMax: job.salaryMax ?? null,
      salaryCurrency: job.salaryCurrency ?? null,

      promoted: job.promoted ?? false,
      source: job.source,
      url: job.url ?? null,

      role: job.role ?? null,

      requirements: job.requirements,
      responsibilities: job.responsibilities,
      benefits: job.benefits ?? null,

      workplaceType: job.workplaceType,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,

      externalId: job.externalId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
