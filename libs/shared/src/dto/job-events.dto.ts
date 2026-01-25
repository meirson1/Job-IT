import { CreateOrUpdateJobDto } from './create-or-update-job.dto';

export class JobUpsertedEventDto extends CreateOrUpdateJobDto {
  operation: 'created' | 'updated';
  jobId: number;
}

export class JobDeletedEventDto extends CreateOrUpdateJobDto {
  jobId: number;
}
