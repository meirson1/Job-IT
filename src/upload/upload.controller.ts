import {
  Body,
  Controller,
  Delete,
  Get,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file')
export class UploadController {
  constructor(private readonly fileService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /^(application\/pdf|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/msword)$/,
          }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file);
    return this.fileService.uploadFile(file, 'Resume');
  }

  @Get()
  getFile(@Query('key') key: string) {
    return this.fileService.getFile(key);
  }

  @Delete()
  deleteFile(@Query('key') key: string) {
    return this.fileService.deleteFile(key);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  updateFile(
    @Body() body: { key: string },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /^(application\/pdf|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/msword)$/,
          }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileService.updateFile(body.key, file);
  }
}
