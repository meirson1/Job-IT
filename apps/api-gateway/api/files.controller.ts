import {
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';

@Controller('files')
export class FilesController {
  constructor(@Inject('FILE_SERVICE') private readonly client: ClientProxy) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    return firstValueFrom(
      this.client.send('files.upload', {
        buffer: Array.from(file.buffer),
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }),
    );
  }

  @Get()
  getFile(@Query('key') key: string): Promise<any> {
    return firstValueFrom(this.client.send('files.get', key));
  }

  @Delete()
  deleteFile(@Query('key') key: string): Promise<any> {
    return firstValueFrom(this.client.send('files.delete', key));
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @Body() body: { key: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    return firstValueFrom(
      this.client.send('files.update', {
        key: body.key,
        file: {
          buffer: Array.from(file.buffer),
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
      }),
    );
  }
}
