/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { JobSource } from '@prisma/client';

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

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsBoolean()
  @IsOptional()
  promoted?: boolean;

  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @IsOptional()
  salaryCurrency?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(JobSource)
  @IsOptional()
  source?: JobSource;

  @IsBoolean()
  @IsOptional()
  easyApply?: boolean;

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
