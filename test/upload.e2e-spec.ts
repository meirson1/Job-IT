import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { UploadService } from './../src/upload/upload.service';
import 'multer';

describe('UploadController (e2e)', () => {
  let app: INestApplication;
  const mockUploadService = {
    uploadFile: jest.fn().mockResolvedValue({
      key: 'Resume/123456789-abcde.pdf',
      url: 'http://mock-minio:9000/bucket/Resume/123456789-abcde.pdf?signature=...',
      size: 1024,
      mimeType: 'application/pdf',
    }),
    getFile: jest.fn().mockResolvedValue({
      key: 'test-key',
      url: 'http://mock-minio:9000/bucket/test-key?signature=...',
    }),
    deleteFile: jest.fn().mockResolvedValue({ ok: true }),
    updateFile: jest.fn().mockResolvedValue({
      key: 'test-key',
      url: 'http://mock-minio:9000/bucket/test-key?signature=...',
      size: 2048,
      mimeType: 'application/pdf',
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UploadService)
      .useValue(mockUploadService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('/file/upload (POST)', () => {
    it('should upload a valid PDF file', () => {
      const buffer = Buffer.from('mock pdf content');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .post('/file/upload')
        .attach('file', buffer, {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('key');
          expect(res.body).toHaveProperty('url');
          expect(res.body).toHaveProperty('mimeType', 'application/pdf');
        });
    });

    it('should fail if file type is not allowed (e.g., .txt)', () => {
      const buffer = Buffer.from('mock txt content');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .post('/file/upload')
        .attach('file', buffer, 'test.txt')
        .expect(400);
    });

    it('should fail if file is too large (> 5MB)', () => {
      const largeBuffer = Buffer.alloc(1024 * 1024 * 6); // 6MB
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .post('/file/upload')
        .attach('file', largeBuffer, 'large.pdf')
        .expect(400);
    });
  });

  describe('/file (GET)', () => {
    it('should return file info for a valid key', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .get('/file')
        .query({ key: 'test-key' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('key', 'test-key');
          expect(res.body).toHaveProperty('url');
        });
    });
  });

  describe('/file (DELETE)', () => {
    it('should delete a file and return ok', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .delete('/file')
        .query({ key: 'test-key' })
        .expect(200)
        .expect({ ok: true });
    });
  });

  describe('/file (PATCH)', () => {
    it('should update an existing file', () => {
      const buffer = Buffer.from('updated content');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .patch('/file')
        .field('key', 'test-key')
        .attach('file', buffer, {
          filename: 'updated.pdf',
          contentType: 'application/pdf',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('key', 'test-key');
          expect(res.body).toHaveProperty('url');
        });
    });
  });
});
