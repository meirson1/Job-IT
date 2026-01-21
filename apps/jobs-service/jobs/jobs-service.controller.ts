import { Controller, Logger } from '@nestjs/common';
import { JobsService } from './jobs-service.service';
import { CreateOrUpdateJobDto } from '@app/shared';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private jobsService: JobsService) {}

  @MessagePattern('jobs.upsert')
  async upsertJob(@Payload() data: CreateOrUpdateJobDto) {
    const result = await this.jobsService.upsertJob(data);
    this.logger.log(`PUT /jobs - upsert ok id: ${result.id}`);
    return result;
  }

  @MessagePattern('jobs.findAll')
  async findAllJobs() {
    const result = await this.jobsService.findAllJobs();
    this.logger.log('GET /jobs - 200 OK');
    return result;
  }

  @MessagePattern('jobs.find')
  async findJob(@Payload() id: number | string) {
    const numericId = Number(id);
    const result = await this.jobsService.findJob(numericId);
    this.logger.log(`GET /jobs/${numericId} - 200 OK`);
    return result;
  }

  @MessagePattern('jobs.delete')
  async deleteJob(@Payload() id: number | string) {
    const numericId = Number(id);
    await this.jobsService.deleteJob(numericId);
    this.logger.log(`DELETE /jobs/${numericId} - 204 No Content`);
    return { success: true };
  }
}
