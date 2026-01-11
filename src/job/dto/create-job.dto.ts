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
  @IsOptional()
  location?: string;

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

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  responsibilities?: string;

  @IsString()
  @IsOptional()
  benefits?: string;

  @IsEnum(WorkplaceType)
  @IsOptional()
  workplaceType?: WorkplaceType;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;
}
