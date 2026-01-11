import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  private logger = console;

  onModuleInit() {
    this.logger.log('✅ JobsService connected to database');
  }

  async createJob(dto: CreateJobDto) {
    return this.prisma.job.create({
      data: this.mapJobData(dto),
    });
  }

  async updateJob(id: number, dto: UpdateJobDto) {
    await this.ensureJobExists(id);
    return this.prisma.job.update({
      where: { id },
      data: this.mapJobData(dto),
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

  // overloads
  private mapJobData(dto: CreateJobDto): Prisma.JobCreateInput;
  private mapJobData(dto: UpdateJobDto): Prisma.JobUpdateInput;

  // implementation (one function)
  private mapJobData(dto: CreateJobDto | UpdateJobDto) {
    const { companyId, ...rest } = dto;

    const data = {
      ...rest,
      ...(companyId !== undefined
        ? { company: { connect: { id: companyId } } }
        : {}),
    };
    return data as Prisma.JobCreateInput | Prisma.JobUpdateInput;
  }
}
