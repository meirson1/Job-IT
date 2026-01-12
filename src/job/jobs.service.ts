import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { CreateJobDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  private logger = console;

  onModuleInit() {
    this.logger.log('✅ JobsService connected to database');
  }

  async createOrUpdateJob(dto: CreateJobDto) {
    return this.prisma.job.upsert({
      where: { source_url: { source: dto.source, url: dto.url } },
      create: this.toData(dto),
      update: this.toData(dto),
    });
  }

  async deleteJob(id: number) {
    await this.ensureJobExists(id);
    await this.prisma.job.delete({ where: { id } });
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
    dto: CreateJobDto,
  ): Prisma.JobCreateInput & Prisma.JobUpdateInput {
    const { companyId, ...rest } = dto;

    return {
      ...rest,
      ...(companyId !== undefined
        ? { company: { connect: { id: companyId } } }
        : {}),
    };
  }
}
