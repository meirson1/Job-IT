import { IsString, MinLength } from 'class-validator';

export class FileKeyDto {
  @IsString()
  @MinLength(1, { message: 'key is required' })
  key!: string;
}
