import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { FileService } from './file-service.service';

interface FilePayload {
  buffer: string;
  originalname: string;
  mimetype: string;
  size: number;
}

interface FileKeyPayload {
  key: string;
}

interface UpdateFilePayload extends FileKeyPayload {
  file: FilePayload;
}

@Controller()
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @MessagePattern('files.upload')
  async uploadFile(@Payload() data: { file: FilePayload; category?: string }) {
    this.logger.log(
      `✅ Received TCP file upload: ${data.file.originalname} (${data.file.size} bytes)`,
    );
    const file = this.reconstructFile(data.file);
    this.validateFile(file);
    return this.fileService.uploadFile(file, data.category || 'Resume');
  }

  @MessagePattern('files.update')
  async updateFile(@Payload() data: UpdateFilePayload) {
    if (!data.key) {
      throw new RpcException('File key is missing');
    }
    this.logger.log(
      `✅ Received TCP PATCH request to update file: ${data.key}`,
    );
    const file = this.reconstructFile(data.file);
    this.validateFile(file);
    const result = await this.fileService.updateFile(data.key, file);
    this.logger.log(`✅ File updated successfully: ${result.key}`);
    return result;
  }

  @MessagePattern('files.get')
  async getFile(@Payload() data: FileKeyPayload) {
    if (!data.key) {
      throw new RpcException('File key is missing');
    }
    this.logger.log(`Received TCP GET request for file: ${data.key}`);
    return this.fileService.getFile(data.key);
  }

  @MessagePattern('files.delete')
  async deleteFile(@Payload() data: FileKeyPayload) {
    if (!data.key) {
      throw new RpcException('File key is missing');
    }
    this.logger.log(`Received TCP DELETE request for file: ${data.key}`);
    return this.fileService.deleteFile(data.key);
  }

  private reconstructFile(filePayload: FilePayload): Express.Multer.File {
    return {
      buffer: Buffer.from(filePayload.buffer, 'base64'),
      originalname: filePayload.originalname,
      mimetype: filePayload.mimetype,
      size: filePayload.size,
      fieldname: 'file',
      encoding: '7bit',
      stream: null as unknown as import('stream').Readable,
      destination: '',
      filename: '',
      path: '',
    };
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
