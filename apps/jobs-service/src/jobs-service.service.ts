import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  Logger,
  OnModuleDestroy,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@app/database';
import { CreateOrUpdateJobDto } from '@app/shared';
import { Prisma } from '@app/database';
import { randomUUID } from 'crypto';
import { isUUID } from 'class-validator';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.logger.log('✅ JobsService connected to database');
    await this.kafkaClient.connect();
    this.logger.log('✅ Kafka client connected');
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.log('✅ Kafka client disconnected');
  }

  async createOrUpdateJob(dto: CreateOrUpdateJobDto) {
    const externalId = dto.externalId ?? randomUUID();
    if (!isUUID(externalId))
      throw new BadRequestException('externalId must be a valid UUID');

    const existingJob = await this.prisma.job.findUnique({
      where: { externalId },
      select: { id: true },
    });

    const operation: 'created' | 'updated' = existingJob
      ? 'updated'
      : 'created';

    const job = await this.prisma.job.upsert({
      where: { externalId },
      create: this.toData({ ...dto, externalId }),
      update: this.toData({ ...dto, externalId }),
    });

    const completeJob = await this.prisma.job.findUnique({
      where: { id: job.id },
      include: { company: true },
    });

    if (!completeJob) {
      this.logger.error(
        `Job ${job.id} not found after upsert - this should never happen`,
      );
      return job;
    }

    this.kafkaClient.emit('job.upserted', {
      operation,
      jobId: completeJob.id,
      title: completeJob.title,
      description: completeJob.description,
      location: completeJob.location,
      companyName: completeJob.company?.name ?? null,
      salaryMin: completeJob.salaryMin,
      salaryMax: completeJob.salaryMax,
      salaryCurrency: completeJob.salaryCurrency,
      promoted: completeJob.promoted ?? false,
      source: completeJob.source,
      url: completeJob.url,
      role: completeJob.role,
      requirements: completeJob.requirements,
      responsibilities: completeJob.responsibilities,
      benefits: completeJob.benefits,
      workplaceType: completeJob.workplaceType,
      employmentType: completeJob.employmentType,
      experienceLevel: completeJob.experienceLevel,
      externalId: completeJob.externalId,
      createdAt: completeJob.createdAt,
      updatedAt: completeJob.updatedAt,
    });

    return job;
  }

  async deleteJob(id: number) {
    const job = await this.ensureJobExists(id);
    await this.prisma.job.delete({ where: { id } });

    this.kafkaClient.emit('job.deleted', {
      jobId: job.id,
    });

    return { ok: true };
  }

  findJob(id: number) {
    return this.ensureJobExists(id);
  }

  findAllJobs() {
    return this.prisma.job.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async ensureJobExists(id: number) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  private toData(
    dto: CreateOrUpdateJobDto & { externalId: string },
  ): Prisma.JobCreateInput & Prisma.JobUpdateInput {
    const { companyName, url, ...rest } = dto;

    return {
      ...rest,
      url: url ?? null,
      ...(companyName
        ? {
            company: {
              connectOrCreate: {
                where: { name: companyName },
                create: { name: companyName },
              },
            },
          }
        : {}),
    };
  }
}
