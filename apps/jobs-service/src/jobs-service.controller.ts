import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Logger,
  HttpStatus,
  HttpCode,
  Put,
} from '@nestjs/common';
import { JobsService } from './jobs-service.service';
import { CreateOrUpdateJobDto } from '@app/shared';

@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private jobsService: JobsService) {}

  @Put()
  async createJob(@Body() data: CreateOrUpdateJobDto) {
    const result = await this.jobsService.createOrUpdateJob(data);
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
  async findJob(@Param('id', ParseIntPipe) id: number) {
    const result = await this.jobsService.findJob(id);
    this.logger.log(`GET /jobs/${id} - 200 OK`);
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJob(@Param('id', ParseIntPipe) id: number) {
    await this.jobsService.deleteJob(id);
    this.logger.log(`DELETE /jobs/${id} - 204 No Content`);
  }
}
