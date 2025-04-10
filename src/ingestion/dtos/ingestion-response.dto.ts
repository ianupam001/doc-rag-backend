import { ApiProperty } from '@nestjs/swagger';
import { IngestionStatus } from '@prisma/client';
import { DocumentResponseDto } from 'src/documents/dtos';

export class IngestionResponseDto {
  @ApiProperty({ example: 1, description: 'Ingestion process ID' })
  id: number;

  @ApiProperty({ example: 1, description: 'Document ID' })
  documentId: number;

  @ApiProperty({
    enum: IngestionStatus,
    example: IngestionStatus.PROCESSING,
    description: 'Current ingestion status',
  })
  status: IngestionStatus;

  @ApiProperty({
    example: '2023-05-15T10:00:00Z',
    description: 'Process start time',
    required: false,
  })
  startedAt?: Date;

  @ApiProperty({
    example: '2023-05-15T10:05:00Z',
    description: 'Process completion time',
    required: false,
  })
  completedAt?: Date;

  @ApiProperty({
    example: '2023-05-15T10:00:00Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-15T10:05:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    type: () => DocumentResponseDto,
    description: 'Associated document details',
  })
  document?: DocumentResponseDto;
}
    
    