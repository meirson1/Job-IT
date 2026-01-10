import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import 'multer';

@Injectable()
export class UploadService {
  private minio: Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET as string;
    this.minio = new Client({
      endPoint: process.env.MINIO_ENDPOINT as string,
      port: Number(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY as string,
      secretKey: process.env.MINIO_SECRET_KEY as string,
    });
  }

  private async ensureBucket() {
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket);
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'upload') {
    await this.ensureBucket();

    const ext = file.originalname.split('.').pop() ?? 'bin';
    const objectName = `${folder}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    await this.minio.putObject(
      this.bucket,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const url = await this.minio.presignedGetObject(
      this.bucket,
      objectName,
      60 * 60,
    );
    return {
      key: objectName,
      url,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async getFile(key: string) {
    const url = await this.minio.presignedGetObject(this.bucket, key, 60 * 60);
    return {
      key,
      url,
    };
  }

  async deleteFile(key: string) {
    await this.minio.removeObject(this.bucket, key);
    return { ok: true };
  }

  async updateFile(key: string, file: Express.Multer.File) {
    await this.minio.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    const url = await this.minio.presignedGetObject(this.bucket, key, 60 * 60);
    return { key, url, size: file.size, mimeType: file.mimetype };
  }
}
