import {
  Controller,
  Logger,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Delete,
  Patch,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RpcException } from '@nestjs/microservices';
import { FileService } from './file-service.service';

@Controller('files')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(
      `Received HTTP file upload: ${file.originalname} (${file.size} bytes)`,
    );
    this.validateFile(file);
    return this.fileService.uploadFile(file, 'Resume');
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  async updateFilePatch(
    @Body() body: { key: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const key = body.key;
    if (!key) {
      throw new RpcException('File key is missing in body');
    }
    this.logger.log(`Received HTTP PATCH request to update file: ${key}`);
    this.validateFile(file);
    const result = await this.fileService.updateFile(key, file);
    this.logger.log(`File updated successfully: ${result.key}`);
    return result;
  }

  @Get()
  async getFileQuery(@Query('key') key: string) {
    if (!key) {
      throw new RpcException('File key is missing in query params');
    }
    this.logger.log(`Received HTTP GET request (query) for file: ${key}`);
    return this.fileService.getFile(key);
  }

  @Delete()
  async deleteFileQuery(@Query('key') key: string) {
    if (!key) {
      throw new RpcException('File key is missing in query params');
    }
    this.logger.log(`Received HTTP DELETE request (query) for file: ${key}`);
    return this.fileService.deleteFile(key);
  }

  private validateFile(file: Express.Multer.File) {
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new RpcException('Invalid file type. Allowed: PDF, DOC, DOCX');
    }
    if (file.size > 1024 * 1024 * 5) {
      throw new RpcException('File too large');
    }
  }
}
