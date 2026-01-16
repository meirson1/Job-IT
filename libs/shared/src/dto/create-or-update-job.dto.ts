import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  EmploymentType,
  ExperienceLevel,
  JobRole,
  JobSource,
  WorkplaceType,
} from '@app/database';

export class CreateOrUpdateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsInt()
  @IsOptional()
  companyId?: number;

  @IsInt()
  @IsOptional()
  salaryMin?: number;

  @IsInt()
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @IsOptional()
  salaryCurrency?: string;

  @IsBoolean()
  @IsOptional()
  promoted?: boolean;

  @IsEnum(JobSource)
  @IsNotEmpty()
  source: JobSource;

  @IsString()
  @IsOptional()
  url?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(JobRole, { each: true })
  role?: JobRole[];

  @IsString()
  @IsNotEmpty()
  requirements: string;

  @IsString()
  @IsNotEmpty()
  responsibilities: string;

  @IsString()
  @IsOptional()
  benefits?: string;

  @IsNotEmpty()
  @IsEnum(WorkplaceType)
  workplaceType: WorkplaceType;

  @IsNotEmpty()
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsEnum(ExperienceLevel)
  @IsNotEmpty()
  experienceLevel: ExperienceLevel;
}
