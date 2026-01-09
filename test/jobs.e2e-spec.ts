import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JobSource } from '@prisma/client';

interface JobResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  url: string;
  source: JobSource;
  promoted: boolean;
  easyApply: boolean;
  externalId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  company: {
    id: number;
    name: string;
  };
}

describe('JobsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // Clean up database before each test
  beforeEach(async () => {
    await prisma.job.deleteMany();
    await prisma.company.deleteMany();
  });

  describe('POST /jobs - Create Job', () => {
    it('should return 400 when body is empty', () => {
      return request(app.getHttpServer() as string)
        .post('/jobs')
        .send({})
        .expect(400);
    });

    it('should return 400 when required fields are missing', () => {
      return request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Software Engineer',
        })
        .expect(400);
    });

    it('should create a job with valid data and return 201', async () => {
      const jobData = {
        title: 'Senior Software Engineer',
        description: 'We are looking for a senior software engineer...',
        location: 'Tel Aviv, Israel',
        companyName: 'Tech Corp',
        url: 'https://example.com/job/123',
        source: 'LINKEDIN',
      };

      const response = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send(jobData)
        .expect(201);

      const body = response.body as JobResponse;
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(jobData.title);
      expect(body.description).toBe(jobData.description);
      expect(body.location).toBe(jobData.location);
      expect(body.url).toBe(jobData.url);
      expect(body.source).toBe(jobData.source);
      expect(body.promoted).toBe(false);
      expect(body.easyApply).toBe(false);
      expect(body.company).toBeDefined();
      expect(body.company.name).toBe(jobData.companyName);
    });

    it('should create a job with all optional fields', async () => {
      const jobData = {
        title: 'Full Stack Developer',
        description: 'Build amazing web applications',
        location: 'Remote',
        companyName: 'StartupXYZ',
        url: 'https://example.com/job/456',
        source: 'COMPANY_SITE',
        salaryMin: 15000,
        salaryMax: 25000,
        salaryCurrency: 'ILS',
        promoted: true,
        easyApply: true,
        externalId: 'ext123',
        tags: ['javascript', 'react', 'nodejs'],
      };

      const response = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send(jobData)
        .expect(201);

      const body = response.body as JobResponse;
      expect(body.salaryMin).toBe(jobData.salaryMin);
      expect(body.salaryMax).toBe(jobData.salaryMax);
      expect(body.salaryCurrency).toBe(jobData.salaryCurrency);
      expect(body.promoted).toBe(true);
      expect(body.easyApply).toBe(true);
      expect(body.externalId).toBe(jobData.externalId);
      expect(body.tags).toEqual(jobData.tags);
    });

    it('should reuse existing company when creating job', async () => {
      const companyName = 'Google';

      // Create first job
      await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Job 1',
          description: 'Description 1',
          location: 'Location 1',
          companyName,
          url: 'https://example.com/1',
          source: 'LINKEDIN',
        })
        .expect(201);

      // Create second job with same company
      await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Job 2',
          description: 'Description 2',
          location: 'Location 2',
          companyName,
          url: 'https://example.com/2',
          source: 'LINKEDIN',
        })
        .expect(201);

      // Verify companies have same ID
      const companies = await prisma.company.findMany();
      expect(companies).toHaveLength(1);
      expect(companies[0].name).toBe(companyName);
    });
  });

  describe('GET /jobs - List All Jobs', () => {
    it('should return empty array when no jobs exist', async () => {
      const response = await request(app.getHttpServer() as string)
        .get('/jobs')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all jobs with company information', async () => {
      // Create test jobs
      await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Backend Developer',
          description: 'Build APIs',
          location: 'Haifa',
          companyName: 'Company A',
          url: 'https://example.com/1',
          source: 'LINKEDIN',
        });

      await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Frontend Developer',
          description: 'Build UIs',
          location: 'Jerusalem',
          companyName: 'Company B',
          url: 'https://example.com/2',
          source: 'INDEED',
        });

      const response = await request(app.getHttpServer() as string)
        .get('/jobs')
        .expect(200);

      const body = response.body as JobResponse[];
      expect(body).toHaveLength(2);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('company');
      expect(body[1]).toHaveProperty('company');
    });

    it('should return jobs ordered by createdAt desc', async () => {
      // Create jobs with slight delay
      const job1Response = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Job 1',
          description: 'First job',
          location: 'Location 1',
          companyName: 'Company A',
          url: 'https://example.com/1',
          source: 'LINKEDIN',
        });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const job2Response = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Job 2',
          description: 'Second job',
          location: 'Location 2',
          companyName: 'Company B',
          url: 'https://example.com/2',
          source: 'INDEED',
        });

      const response = await request(app.getHttpServer() as string)
        .get('/jobs')
        .expect(200);

      const body = response.body as JobResponse[];
      const job1 = job1Response.body as JobResponse;
      const job2 = job2Response.body as JobResponse;

      // Most recent job should be first
      expect(body[0].id).toBe(job2.id);
      expect(body[1].id).toBe(job1.id);
    });
  });

  describe('GET /jobs/:id - Get Single Job', () => {
    it('should return 404 when job does not exist', async () => {
      await request(app.getHttpServer() as string)
        .get('/jobs/99999')
        .expect(404);
    });

    it('should return job with company information', async () => {
      // Create a job
      const createResponse = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'DevOps Engineer',
          description: 'Manage infrastructure',
          location: 'Beer Sheva',
          companyName: 'CloudTech',
          url: 'https://example.com/devops',
          source: 'COMPANY_SITE',
        })
        .expect(201);

      const jobId = (createResponse.body as JobResponse).id;

      // Get the job
      const response = await request(app.getHttpServer() as string)
        .get(`/jobs/${jobId}`)
        .expect(200);

      const body = response.body as JobResponse;
      expect(body.id).toBe(jobId);
      expect(body.title).toBe('DevOps Engineer');
      expect(body.company).toBeDefined();
      expect(body.company.name).toBe('CloudTech');
    });
  });

  describe('PATCH /jobs/:id - Update Job', () => {
    it('should return 404 when updating non-existent job', async () => {
      await request(app.getHttpServer() as string)
        .patch('/jobs/99999')
        .send({ title: 'New Title' })
        .expect(404);
    });

    it('should update job title', async () => {
      // Create a job
      const createResponse = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Original Title',
          description: 'Description',
          location: 'Location',
          companyName: 'Company',
          url: 'https://example.com/1',
          source: 'LINKEDIN',
        })
        .expect(201);

      const jobId = (createResponse.body as JobResponse).id;

      // Update the job
      const response = await request(app.getHttpServer() as string)
        .patch(`/jobs/${jobId}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      const body = response.body as JobResponse;
      expect(body.title).toBe('Updated Title');
      expect(body.description).toBe('Description'); // Other fields unchanged
    });

    it('should update multiple fields at once', async () => {
      // Create a job
      const createResponse = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'QA Engineer',
          description: 'Test software',
          location: 'Netanya',
          companyName: 'TestCorp',
          url: 'https://example.com/qa',
          source: 'LINKEDIN',
          promoted: false,
        })
        .expect(201);

      const jobId = (createResponse.body as JobResponse).id;

      // Update multiple fields
      const response = await request(app.getHttpServer() as string)
        .patch(`/jobs/${jobId}`)
        .send({
          title: 'Senior QA Engineer',
          location: 'Herzliya',
          promoted: true,
        })
        .expect(200);

      const body = response.body as JobResponse;
      expect(body.title).toBe('Senior QA Engineer');
      expect(body.location).toBe('Herzliya');
      expect(body.promoted).toBe(true);
    });

    it('should update company name and create/reuse company', async () => {
      // Create a job
      const createResponse = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Data Analyst',
          description: 'Analyze data',
          location: 'Tel Aviv',
          companyName: 'OldCompany',
          url: 'https://example.com/data',
          source: 'INDEED',
        })
        .expect(201);

      const jobId = (createResponse.body as JobResponse).id;

      // Update company
      const response = await request(app.getHttpServer() as string)
        .patch(`/jobs/${jobId}`)
        .send({ companyName: 'NewCompany' })
        .expect(200);

      const body = response.body as JobResponse;
      expect(body.company.name).toBe('NewCompany');
    });

    it('should update tags array', async () => {
      // Create a job
      const createResponse = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Mobile Developer',
          description: 'Build mobile apps',
          location: 'Raanana',
          companyName: 'MobileInc',
          url: 'https://example.com/mobile',
          source: 'COMPANY_SITE',
          tags: ['ios', 'swift'],
        })
        .expect(201);

      const jobId = (createResponse.body as JobResponse).id;

      // Update tags
      const response = await request(app.getHttpServer() as string)
        .patch(`/jobs/${jobId}`)
        .send({ tags: ['ios', 'swift', 'swiftui'] })
        .expect(200);

      const body = response.body as JobResponse;
      expect(body.tags).toEqual(['ios', 'swift', 'swiftui']);
    });
  });

  describe('DELETE /jobs/:id - Delete Job', () => {
    it('should return 404 when deleting non-existent job', async () => {
      await request(app.getHttpServer() as string)
        .delete('/jobs/99999')
        .expect(404);
    });

    it('should delete job and return 204', async () => {
      // Create a job
      const createResponse = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Security Engineer',
          description: 'Secure systems',
          location: 'Petah Tikva',
          companyName: 'SecureTech',
          url: 'https://example.com/security',
          source: 'LINKEDIN',
        })
        .expect(201);

      const jobId = (createResponse.body as JobResponse).id;

      // Delete the job
      await request(app.getHttpServer() as string)
        .delete(`/jobs/${jobId}`)
        .expect(204);

      // Verify job is deleted
      await request(app.getHttpServer() as string)
        .get(`/jobs/${jobId}`)
        .expect(404);
    });

    it('should actually remove job from database', async () => {
      // Create a job
      const createResponse = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Product Manager',
          description: 'Manage products',
          location: 'Tel Aviv',
          companyName: 'ProductCo',
          url: 'https://example.com/pm',
          source: 'COMPANY_SITE',
        })
        .expect(201);

      const jobId = (createResponse.body as JobResponse).id;

      // Delete the job
      await request(app.getHttpServer() as string)
        .delete(`/jobs/${jobId}`)
        .expect(204);

      // Check database directly
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      expect(job).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should set default values correctly', async () => {
      const response = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Test Job',
          description: 'Test Description',
          location: 'Test Location',
          companyName: 'Test Company',
          url: 'https://example.com/test',
          source: 'LINKEDIN',
        })
        .expect(201);

      const body = response.body as JobResponse;
      expect(body.promoted).toBe(false);
      expect(body.easyApply).toBe(false);
      expect(body.tags).toEqual([]);
    });

    it('should set timestamps on creation', async () => {
      const response = await request(app.getHttpServer() as string)
        .post('/jobs')
        .send({
          title: 'Timestamp Test',
          description: 'Testing timestamps',
          location: 'Location',
          companyName: 'TimeCorp',
          url: 'https://example.com/time',
          source: 'INDEED',
        })
        .expect(201);

      const body = response.body as JobResponse;
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
      expect(new Date(body.createdAt).getTime()).toBeLessThanOrEqual(
        Date.now(),
      );
    });

    it('should include all job sources', async () => {
      const sources: JobSource[] = [
        'LINKEDIN',
        'COMPANY_SITE',
        'GREENHOUSE',
        'LEVER',
        'INDEED',
        'OTHER',
      ];

      for (const source of sources) {
        const response = await request(app.getHttpServer() as string)
          .post('/jobs')
          .send({
            title: `Job from ${source}`,
            description: 'Description',
            location: 'Location',
            companyName: `Company ${source}`,
            url: `https://example.com/${source}`,
            source,
          })
          .expect(201);

        expect((response.body as JobResponse).source).toBe(source);
      }
    });
  });
});
