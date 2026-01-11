import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Client } from 'minio';

@Injectable()
export class UploadService implements OnModuleInit {
  private minio: Client;
  private bucket: string;
  private urlExpiresSeconds: number;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET!;
    this.urlExpiresSeconds =
      Number(process.env.MINIO_URL_EXPIRES_SECONDS) || 60 * 60;

    this.minio = new Client({
      endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
      port: Number(process.env.MINIO_PORT ?? 9000),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'minio',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'minio123',
    });
  }

  async onModuleInit() {
    const autoCreate = process.env.MINIO_AUTO_CREATE_BUCKET === 'true';
    if (!autoCreate) return;

    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket);
      console.log(`🪣 MinIO bucket "${this.bucket}" created`);
    }
  }

  private buildObjectName(folder: string, file: Express.Multer.File): string {
    const owner = process.env.MINIO_OWNER ?? 'anon';

    const ext = (file.originalname.split('.').pop() || 'bin').toLowerCase();

    return `${folder}/${owner}/${randomUUID()}.${ext}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'upload',
  ): Promise<{
    key: string;
    url: string;
    size: number;
    mimeType: string;
    originalname: string;
  }> {
    const objectName = this.buildObjectName(folder, file);

    await this.minio.putObject(
      this.bucket,
      objectName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    const url = await this.minio.presignedGetObject(
      this.bucket,
      objectName,
      this.urlExpiresSeconds,
    );

    return {
      key: objectName,
      url,
      size: file.size,
      mimeType: file.mimetype,
      originalname: file.originalname,
    };
  }

  async getFile(key: string): Promise<{ key: string; url: string }> {
    const url = await this.minio.presignedGetObject(
      this.bucket,
      key,
      this.urlExpiresSeconds,
    );
    return {
      key,
      url,
    };
  }

  async deleteFile(key: string): Promise<{ ok: boolean }> {
    await this.minio.removeObject(this.bucket, key);
    return { ok: true };
  }

  async updateFile(
    key: string,
    file: Express.Multer.File,
  ): Promise<{
    key: string;
    url: string;
    size: number;
    mimeType: string;
    originalname: string;
  }> {
    await this.minio.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    const url = await this.minio.presignedGetObject(
      this.bucket,
      key,
      this.urlExpiresSeconds,
    );
    return {
      key,
      url,
      size: file.size,
      mimeType: file.mimetype,
      originalname: file.originalname,
    };
  }
}
