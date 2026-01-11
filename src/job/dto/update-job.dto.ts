import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  EmploymentType,
  ExperienceLevel,
  JobSource,
  WorkplaceType,
} from '@prisma/client';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsInt()
  @IsOptional()
  companyId?: number;

  @IsBoolean()
  @IsOptional()
  promoted?: boolean;

  @IsInt()
  @IsOptional()
  salaryMin?: number;

  @IsInt()
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @IsOptional()
  salaryCurrency?: string;

  @IsEnum(JobSource)
  @IsOptional()
  source?: JobSource;

  @IsString()
  @IsOptional()
  url?: string;

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
