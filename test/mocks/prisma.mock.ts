import { Document } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

// For Prisma v5+ with extended types
export const mockPrismaService = mockDeep<{
  document: {
    create: (args: any) => Promise<Document>;
    findMany: (args?: any) => Promise<Document[]>;
    findUnique: (args: any) => Promise<Document | null>;
    update: (args: any) => Promise<Document>;
    delete: (args: any) => Promise<Document>;
  };
}>();

export const mockDocument = (overrides?: Partial<Document>): Document => ({
  id: 1,
  title: 'Test Document',
  description: null,
  filePath: 'test.pdf',
  fileType: 'application/pdf',
  fileSize: 1024,
  userId: 1,
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
