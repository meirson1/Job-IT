import { Controller } from '@nestjs/common';
import { IndexerService } from './indexer-service.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @EventPattern('job.upserted')
  handleJobUpserted(@Payload() data: any) {
    return this.indexerService.indexJob(data);
  }

  @EventPattern('job.deleted')
  handleJobDeleted(@Payload() data: any) {
    return this.indexerService.deleteJob(data);
  }
}
