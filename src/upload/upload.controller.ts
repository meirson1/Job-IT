import {
  Body,
  Controller,
  Delete,
  Get,
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
import { GetFileQueryDto, UpdateFileDto } from './dto';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Controller('file')
export class UploadController {
  constructor(private readonly fileService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          {
            isValid: (file: Express.Multer.File) =>
              !!file && ALLOWED_FILE_TYPES.includes(file.mimetype),
            buildErrorMessage: () =>
              'Invalid file type. Allowed: PDF, DOC, DOCX',
          } as any,
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileService.uploadFile(file, 'Resume');
  }

  @Get()
  getFile(@Query() query: GetFileQueryDto) {
    return this.fileService.getFile(query.key);
  }

  @Delete()
  deleteFile(@Query() query: GetFileQueryDto) {
    return this.fileService.deleteFile(query.key);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  updateFile(
    @Body() body: UpdateFileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          {
            isValid: (file: Express.Multer.File) =>
              !!file && ALLOWED_FILE_TYPES.includes(file.mimetype),
            buildErrorMessage: () =>
              'Invalid file type. Allowed: PDF, DOC, DOCX',
          } as any,
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileService.updateFile(body.key, file);
  }
}
