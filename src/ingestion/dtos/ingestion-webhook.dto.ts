import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { IngestionStatus } from '@prisma/client';

export class IngestionWebhookDto {
  @ApiProperty({ example: 1, description: 'Document ID' })
  @IsNumber()
  documentId: number;

  @ApiProperty({
    enum: IngestionStatus,
    example: IngestionStatus.COMPLETED,
    description: 'Updated ingestion status',
  })
  @IsEnum(IngestionStatus)
  status: IngestionStatus;
}
