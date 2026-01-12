import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  EmploymentType,
  ExperienceLevel,
  JobRole,
  JobSource,
  WorkplaceType,
} from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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
  @IsNotEmpty()
  url: string;

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

  @IsEnum(WorkplaceType)
  workplaceType: WorkplaceType;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsEnum(ExperienceLevel)
  @IsNotEmpty()
  experienceLevel: ExperienceLevel;
}
