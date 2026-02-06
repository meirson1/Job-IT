import { Controller } from '@nestjs/common';
import { IndexerService } from './indexer-service.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JobUpsertedEventDto, JobDeletedEventDto } from '@app/shared';

@Controller()
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @EventPattern('job.upserted')
  handleJobUpserted(@Payload() data: JobUpsertedEventDto) {
    return this.indexerService.indexJob(data);
  }

  @EventPattern('job.deleted')
  handleJobDeleted(@Payload() data: JobDeletedEventDto) {
    return this.indexerService.deleteJob(data);
  }
}
