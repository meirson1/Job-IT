import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  createJob(@Body() data: CreateJobDto) {
    return this.jobsService.createJob(data);
  }

  @Get()
  findAllJobs() {
    return this.jobsService.findAllJobs();
  }

  @Get(':id')
  findJob(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findJob(id);
  }

  @Put(':id')
  updateJob(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateJobDto) {
    return this.jobsService.updateJob(id, data);
  }

  @Delete(':id')
  deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.deleteJob(id);
  }
}
