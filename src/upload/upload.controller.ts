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
  FileValidator,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileKeyDto } from './dto';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

class CustomFileTypeValidator extends FileValidator {
  isValid(file?: Express.Multer.File): boolean {
    return !!file && ALLOWED_FILE_TYPES.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return 'Invalid file type. Allowed: PDF, DOC, DOCX';
  }
}

const uploadFilePipe = new ParseFilePipe({
  fileIsRequired: true,
  validators: [
    new CustomFileTypeValidator({}),
    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
  ],
});

@Controller('file')
export class UploadController {
  constructor(private readonly fileService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile(uploadFilePipe) file: Express.Multer.File) {
    return this.fileService.uploadFile(file, 'Resume');
  }

  @Get()
  getFile(@Query() query: FileKeyDto) {
    return this.fileService.getFile(query.key);
  }

  @Delete()
  deleteFile(@Query() query: FileKeyDto) {
    return this.fileService.deleteFile(query.key);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  updateFile(
    @Body() body: FileKeyDto,
    @UploadedFile(uploadFilePipe) file: Express.Multer.File,
  ) {
    return this.fileService.updateFile(body.key, file);
  }
}
