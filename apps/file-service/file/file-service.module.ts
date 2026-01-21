import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './file-service.controller';
import { FileService } from './file-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [FileService],
  controllers: [UploadController],
  exports: [FileService],
})
export class FileModule {}
