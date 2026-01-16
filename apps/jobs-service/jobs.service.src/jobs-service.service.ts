import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  Logger,
  OnModuleDestroy,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateOrUpdateJobDto } from '@app/shared';
import { Prisma } from '@app/database';
import { randomUUID } from 'crypto';
import { Kafka, Producer } from 'kafkajs';
import { isUUID } from 'class-validator';

type JobEventType = 'job.upserted' | 'job.deleted';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);

  private kafkaProducer!: Producer;
  private kafkaTopic!: string;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('✅ JobsService connected to database');

    const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092')
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    this.kafkaTopic = process.env.KAFKA_TOPIC_JOBS || 'jobs.events';

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'jobs-service',
      brokers,
    });

    this.kafkaProducer = kafka.producer();
    await this.kafkaProducer.connect();
    this.logger.log(`✅ Kafka producer connected (topic: ${this.kafkaTopic})`);
  }

  async onModuleDestroy() {
    if (this.kafkaProducer) {
      await this.kafkaProducer.disconnect();
      this.logger.log('✅ Kafka producer disconnected');
    }
  }

  private async publish<T>(type: JobEventType, key: string, payload: T) {
    const value = JSON.stringify({
      type,
      at: new Date().toISOString(),
      payload,
    });

    await this.kafkaProducer.send({
      topic: this.kafkaTopic,
      messages: [{ key, value }],
    });
  }

  async createOrUpdateJob(dto: CreateOrUpdateJobDto) {
    const externalId = dto.externalId ?? randomUUID();

    if (!isUUID(externalId)) {
      throw new BadRequestException('externalId must be a valid UUID');
    }

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

    await this.publish('job.upserted', externalId, {
      operation,
      id: job.id,
      externalId: job.externalId,
    });
    return job;
  }

  async deleteJob(id: number) {
    const job = await this.ensureJobExists(id);
    await this.prisma.job.delete({ where: { id } });

    await this.publish('job.deleted', job.externalId, {
      externalId: job.externalId,
      id: job.id,
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
    const { companyId, url, ...rest } = dto;

    return {
      ...rest,
      url: url ?? null,
      ...(typeof companyId === 'number'
        ? { company: { connect: { id: companyId } } }
        : {}),
    };
  }
}
