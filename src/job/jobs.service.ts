import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto';

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    console.log('✅ JobsService connected to database');
  }

  async createJob(dto: CreateJobDto) {
    const company = await this.prisma.company.upsert({
      where: { name: dto.companyName },
      update: {},
      create: { name: dto.companyName },
    });
    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,

        salaryMin: dto.salaryMin ?? undefined,
        salaryMax: dto.salaryMax ?? undefined,
        salaryCurrency: dto.salaryCurrency ?? undefined,

        url: dto.url,
        source: dto.source,
        externalId: dto.externalId ?? undefined,
        tags: dto.tags ?? [],

        promoted: dto.promoted ?? false,
        easyApply: dto.easyApply ?? false,

        companyId: company.id,
      },
      include: {
        company: true,
      },
    });
  }

  async updateJob(id: number, dto: UpdateJobDto) {
    const exists = await this.prisma.job.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Job not found');
    }

    let companyId: number | undefined;
    if (dto.companyName) {
      const company = await this.prisma.company.upsert({
        where: { name: dto.companyName },
        update: {},
        create: { name: dto.companyName },
      });
      companyId = company.id;
    }
    return this.prisma.job.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        description: dto.description ?? undefined,
        location: dto.location ?? undefined,

        salaryMin: dto.salaryMin ?? undefined,
        salaryMax: dto.salaryMax ?? undefined,
        salaryCurrency: dto.salaryCurrency ?? undefined,

        url: dto.url ?? undefined,
        source: dto.source ?? undefined,
        tags: dto.tags ? { set: dto.tags } : undefined,

        promoted: dto.promoted ?? undefined,
        easyApply: dto.easyApply ?? undefined,

        companyId: companyId ?? undefined,
      },
      include: {
        company: true,
      },
    });
  }

  async deleteJob(id: number) {
    const exists = await this.prisma.job.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Job not found');
    }
    await this.prisma.job.delete({ where: { id } });
    return { ok: true };
  }

  async findJob(id: number) {
    const exists = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!exists) {
      throw new NotFoundException('Job not found');
    }
    return exists;
  }

  findAllJobs() {
    return this.prisma.job.findMany({
      include: {
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
