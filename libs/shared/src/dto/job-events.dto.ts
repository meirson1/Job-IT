import {
  EmploymentType,
  ExperienceLevel,
  JobRole,
  JobSource,
  WorkplaceType,
} from '@app/database';

export class JobUpsertedEventDto {
  operation: 'created' | 'updated';
  jobId: number;

  title: string;
  description: string;
  location: string;
  companyName: string | null;

  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;

  promoted: boolean;
  source: JobSource;
  url: string | null;

  role: JobRole[] | null;

  requirements: string;
  responsibilities: string;
  benefits: string | null;

  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;

  externalId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class JobDeletedEventDto {
  jobId: number;
}
