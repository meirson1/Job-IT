import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrUpdateJobDto } from '@app/shared';

@Controller('jobs')
export class JobsController implements OnModuleInit {
  constructor(@Inject('JOB_SERVICE') private readonly client: ClientKafka) {}

  async onModuleInit() {
    const replyTopics = [
      'jobs.upsert',
      'jobs.findAll',
      'jobs.find',
      'jobs.delete',
    ];
    replyTopics.forEach((topic) => this.client.subscribeToResponseOf(topic));
    await this.client.connect();
  }

  @Put()
  upsertJob(@Body() data: CreateOrUpdateJobDto) {
    return this.client.send('jobs.upsert', data);
  }

  @Get()
  findAllJobs() {
    return this.client.send('jobs.findAll', {});
  }

  @Get(':id')
  findJob(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('jobs.find', id);
  }

  @Delete(':id')
  deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('jobs.delete', id);
  }
}
