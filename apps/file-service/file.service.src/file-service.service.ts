import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import 'multer';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Client } from 'minio';

type UploadResponse = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalname: string;
};

@Injectable()
export class FileService implements OnModuleInit {
  private logger = new Logger(FileService.name);

  private minio: Client;
  private bucket: string;
  private urlExpiresSeconds: number;
  private owner: string;
  private autoCreateBucket: boolean;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('MINIO_BUCKET', '');
    if (!this.bucket) throw new Error('MINIO_BUCKET is required');

    this.owner = this.config.get<string>('MINIO_OWNER', 'anon');
    this.urlExpiresSeconds = Number(
      this.config.get<number>('MINIO_URL_EXPIRES_SECONDS', 3600),
    );
    this.autoCreateBucket =
      this.config.get<string>('MINIO_AUTO_CREATE_BUCKET', 'false') === 'true';

    const useSSL = this.config.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const port = this.config.get<number>('MINIO_PORT', 9000);

    this.minio = new Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port,
      useSSL,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY', 'minio'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY', 'minio123'),
    });
    this.logger.log(
      `MINIO_BUCKET=${this.bucket} AUTO_CREATE=${this.autoCreateBucket} ENDPOINT=${this.config.get('MINIO_ENDPOINT')}`,
    );
  }

  async onModuleInit() {
    if (!this.autoCreateBucket) return;

    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket);
      this.logger.log(`🪣 MinIO bucket "${this.bucket}" created`);
    }
  }

  private getExt(originalname: string): string {
    const ext = originalname.split('.').pop()?.toLowerCase();
    return ext && ext.length <= 8 ? ext : 'bin';
  }

  private buildObjectName(folder: string, file: Express.Multer.File): string {
    const owner = this.owner;
    const ext = this.getExt(file.originalname);
    return `${folder}/${owner}/${randomUUID()}.${ext}`;
  }

  private async presignedUrl(key: string): Promise<string> {
    return this.minio.presignedGetObject(
      this.bucket,
      key,
      this.urlExpiresSeconds,
    );
  }

  private toResponse(
    file: Express.Multer.File,
    key: string,
    url: string,
  ): UploadResponse {
    return {
      key,
      url,
      size: file.size,
      mimeType: file.mimetype,
      originalname: file.originalname,
    };
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'upload',
  ): Promise<UploadResponse> {
    const key = this.buildObjectName(folder, file);
    await this.minio.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    const url = await this.presignedUrl(key);
    return this.toResponse(file, key, url);
  }

  async getFile(key: string): Promise<{ key: string; url: string }> {
    const url = await this.presignedUrl(key);
    return { key, url };
  }

  async deleteFile(key: string): Promise<{ ok: boolean }> {
    await this.minio.removeObject(this.bucket, key);
    return { ok: true };
  }

  async updateFile(
    key: string,
    file: Express.Multer.File,
  ): Promise<UploadResponse> {
    await this.minio.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    const url = await this.presignedUrl(key);
    return this.toResponse(file, key, url);
  }
}
