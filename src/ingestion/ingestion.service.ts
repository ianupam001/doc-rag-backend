import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { IngestionStatus, DocumentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async triggerIngestion(documentId: number) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      this.logger.warn(`Document not found for ingestion: ${documentId}`);
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Simulate immediate successful ingestion
    const ingestion = await this.prisma.ingestion.create({
      data: {
        documentId,
        status: IngestionStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    await this.updateDocumentStatus(documentId, DocumentStatus.COMPLETED);

    this.logger.log(`Mock ingestion completed for document ${documentId}`);
    return ingestion;
  }

  async checkIngestionStatus(documentId: number) {
    const ingestion = await this.prisma.ingestion.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
      include: { document: true },
    });

    if (!ingestion) {
      this.logger.warn(
        `Ingestion status check failed: No record for document ${documentId}`,
      );
      throw new NotFoundException(
        `No ingestion record found for document ${documentId}`,
      );
    }

    return ingestion;
  }

  async handleWebhook(data: { documentId: number; status: IngestionStatus }) {
    const { documentId, status } = data;

    const ingestion = await this.prisma.ingestion.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!ingestion) {
      this.logger.error(`Webhook received for unknown document: ${documentId}`);
      throw new NotFoundException('Ingestion record not found');
    }

    const updateData = {
      status,
      completedAt: new Date(),
      ...(status === IngestionStatus.PROCESSING && { startedAt: new Date() }),
    };

    try {
      await this.prisma.$transaction([
        this.prisma.ingestion.update({
          where: { id: ingestion.id },
          data: updateData,
        }),
        this.prisma.document.update({
          where: { id: documentId },
          data: {
            status:
              status === IngestionStatus.COMPLETED
                ? DocumentStatus.COMPLETED
                : DocumentStatus.FAILED,
          },
        }),
      ]);

      this.logger.log(
        `Webhook processed: Document ${documentId}, Status: ${status}`,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error updating webhook ingestion status for document ${documentId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update ingestion status',
      );
    }
  }

  private async updateDocumentStatus(
    documentId: number,
    status: DocumentStatus,
  ) {
    try {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update document ${documentId} to status ${status}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update document status',
      );
    }
  }
}
