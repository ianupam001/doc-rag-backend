import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest, { SuperTest, Test as TestType } from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let request: SuperTest<TestType>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Correct initialization of supertest
    const httpServer = app.getHttpServer();
    request = supertest(httpServer) as unknown as SuperTest<TestType>;

    // Create test user
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        role: UserRole.ADMIN,
      },
    });

    // Login to get auth token
    const loginResponse = await request
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password',
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('Document Operations', () => {
    it('should upload and download a document', async () => {
      // Upload document
      const uploadResponse = await request
        .post('/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .field('title', 'Test Document')
        .expect(201);

      const documentId = uploadResponse.body.id;

      // Download document
      await request
        .get(`/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', 'application/pdf');
    });
  });
});
