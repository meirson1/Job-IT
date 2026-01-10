import { IsString, MinLength } from 'class-validator';

export class GetFileQueryDto {
  @IsString()
  @MinLength(1)
  key!: string;
}
