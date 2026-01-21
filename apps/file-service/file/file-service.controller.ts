import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { FileService } from './file-service.service';
import { Readable } from 'stream';

interface TcpFilePayload {
  buffer: { type: 'Buffer'; data: number[] } | number[];
  originalname: string;
  mimetype: string;
  size: number;
}

interface UpdateFilePayload {
  key: string;
  file: TcpFilePayload;
}

@Controller()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly fileService: FileService) {}

  @MessagePattern('files.upload')
  async uploadFile(@Payload() data: TcpFilePayload) {
    if (!data || !data.buffer) {
      throw new RpcException('File buffer is missing');
    }

    this.logger.log(
      `Received file upload: ${data.originalname} (${data.size} bytes)`,
    );

    try {
      const rawBuffer = Array.isArray(data.buffer)
        ? data.buffer
        : data.buffer.data;
      const buffer = Buffer.from(rawBuffer);

      const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!ALLOWED_TYPES.includes(data.mimetype)) {
        throw new RpcException('Invalid file type. Allowed: PDF, DOC, DOCX');
      }
      if (data.size > 1024 * 1024 * 5) {
        throw new RpcException('File too large');
      }

      const file: Express.Multer.File = {
        buffer,
        originalname: data.originalname,
        mimetype: data.mimetype,
        size: data.size,
        fieldname: 'file',
        encoding: '7bit',
        stream: Readable.from(buffer),
        destination: '',
        filename: '',
        path: '',
      };

      const result = await this.fileService.uploadFile(file, 'Resume');
      this.logger.log(`File uploaded successfully: ${result.key}`);
      return result;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Upload failed';
      this.logger.error(`Error processing upload: ${errMsg}`);
      throw new RpcException(errMsg);
    }
  }

  @MessagePattern('files.get')
  getFile(@Payload() key: string) {
    this.logger.log(`Received request to get file: ${key}`);
    return this.fileService.getFile(key);
  }

  @MessagePattern('files.delete')
  async deleteFile(@Payload() key: string) {
    this.logger.log(`Received request to delete file: ${key}`);
    const result = await this.fileService.deleteFile(key);
    this.logger.log(`File deleted successfully: ${key}`);
    return result;
  }

  @MessagePattern('files.update')
  async updateFile(@Payload() data: UpdateFilePayload) {
    this.logger.log(`Received request to update file: ${data.key}`);
    if (!data.file) throw new RpcException('File is missing');

    const rawBuffer = Array.isArray(data.file.buffer)
      ? data.file.buffer
      : data.file.buffer.data;
    const buffer = Buffer.from(rawBuffer);

    const file: Express.Multer.File = {
      buffer,
      originalname: data.file.originalname,
      mimetype: data.file.mimetype,
      size: data.file.size,
      fieldname: 'file',
      encoding: '7bit',
      stream: Readable.from(buffer),
      destination: '',
      filename: '',
      path: '',
    };

    const result = await this.fileService.updateFile(data.key, file);
    this.logger.log(`File updated successfully: ${result.key}`);
    return result;
  }
}
