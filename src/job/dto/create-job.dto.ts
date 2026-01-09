/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { JobSource } from '@prisma/client';

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

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @IsOptional()
  salaryCurrency?: string;

  @IsBoolean()
  @IsOptional()
  promoted?: boolean;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(JobSource)
  @IsNotEmpty()
  source: JobSource;

  @IsBoolean()
  @IsOptional()
  easyApply?: boolean;

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
