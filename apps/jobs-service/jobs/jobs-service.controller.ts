import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Put,
} from '@nestjs/common';
import { JobsService } from './jobs-service.service';
import { CreateOrUpdateJobDto } from '@app/shared';

@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private jobsService: JobsService) {}

  @Put()
  async upsertJob(@Body() data: CreateOrUpdateJobDto) {
    const result = await this.jobsService.upsertJob(data);
    this.logger.log(`PUT /jobs - upsert ok id: ${result.id}`);
    return result;
  }

  @Get()
  async findAllJobs() {
    const result = await this.jobsService.findAllJobs();
    this.logger.log('GET /jobs - 200 OK');
    return result;
  }

  @Get(':id')
  async findJob(@Param('id') id: number | string) {
    const numericId = Number(id);
    const result = await this.jobsService.findJob(numericId);
    this.logger.log(`GET /jobs/${numericId} - 200 OK`);
    return result;
  }

  @Delete(':id')
  async deleteJob(@Param('id') id: number | string) {
    const numericId = Number(id);
    await this.jobsService.deleteJob(numericId);
    this.logger.log(`DELETE /jobs/${numericId} - 204 No Content`);
    return { success: true };
  }
}
