import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  ParseIntPipe,
  Patch,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto';

@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private jobsService: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJob(@Body() data: CreateJobDto) {
    const result = await this.jobsService.createJob(data);
    this.logger.log('POST /jobs - 201 Created');
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

  @Patch(':id')
  async updateJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateJobDto,
  ) {
    const result = await this.jobsService.updateJob(id, data);
    this.logger.log(`PATCH /jobs/${id} - 200 OK`);
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJob(@Param('id', ParseIntPipe) id: number) {
    await this.jobsService.deleteJob(id);
    this.logger.log(`DELETE /jobs/${id} - 204 No Content`);
  }
}
