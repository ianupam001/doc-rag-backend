import { Test } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IngestionService } from 'src/ingestion/ingestion.service'; // ADD THIS
import * as fs from 'fs';
import * as path from 'path';
import { mockDocument, mockPrismaService } from 'test/mocks/prisma.mock';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
  },
}));

jest.mock('path');

const mockIngestionService = {
  ingestDocument: jest.fn(),
};

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  describe('create', () => {
    it('should create a document', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockDoc = mockDocument({
        title: 'Test',
        filePath: '123-test.pdf',
      });

      mockPrismaService.document.create.mockResolvedValue(mockDoc);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create(1, mockFile, { title: 'Test' });

      expect(result).toEqual(mockDoc);
      expect(mockPrismaService.document.create).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });
  });
});
