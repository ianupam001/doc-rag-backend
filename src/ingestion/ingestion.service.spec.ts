import { Test } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { DocumentStatus, IngestionStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

describe('IngestionService', () => {
  let service: IngestionService;
  let prisma: {
    document: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    ingestion: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: PrismaService,
          useValue: {
            document: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            ingestion: {
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    prisma = module.get(PrismaService);
  });

  describe('triggerIngestion', () => {
    it('should create ingestion record', async () => {
      // Mock document response
      prisma.document.findUnique.mockImplementation(() =>
        Promise.resolve({
          id: 1,
          filePath: 'test.pdf',
          status: DocumentStatus.PENDING,
        }),
      );

      // Mock ingestion creation
      prisma.ingestion.create.mockImplementation(() =>
        Promise.resolve({
          id: 1,
          documentId: 1,
          status: IngestionStatus.COMPLETED,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      // Mock document update
      prisma.document.update.mockImplementation(() =>
        Promise.resolve({
          id: 1,
          status: DocumentStatus.COMPLETED,
        }),
      );

      const result = await service.triggerIngestion(1);
      expect(result.status).toBe(IngestionStatus.COMPLETED);
      expect(prisma.ingestion.create).toHaveBeenCalled();
      expect(prisma.document.update).toHaveBeenCalled();
    });
  });
});
