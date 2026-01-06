import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto';

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    console.log('✅ JobsService connected');
  }

  async createJob(dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        salary: dto.salary,
        companyName: dto.companyName,
      },
    });
  }

  async updateJob(id: number, dto: UpdateJobDto) {
    const exists = await this.prisma.job.findUnique({ where: { id } });
    if (!exists) {
      throw new Error('Job not found');
    }
    return this.prisma.job.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        salary: dto.salary,
      },
    });
  }

  async deleteJob(id: number) {
    const exists = await this.prisma.job.findUnique({ where: { id } });
    if (!exists) {
      throw new Error('Job not found');
    }
    await this.prisma.job.delete({ where: { id } });
    return { ok: true };
  }

  async findJob(id: number) {
    const exists = await this.prisma.job.findUnique({ where: { id } });
    if (!exists) {
      throw new Error('Job not found');
    }
    return exists;
  }

  findAllJobs() {
    return this.prisma.job.findMany();
  }
}
