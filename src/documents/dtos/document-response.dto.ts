import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '@prisma/client';
import { IngestionResponseDto } from 'src/ingestion/dtos';
import { UserResponseDto } from 'src/users/dto';

export class DocumentResponseDto {
  @ApiProperty({ example: 1, description: 'Document ID' })
  id: number;

  @ApiProperty({ example: 'Project Report', description: 'Document title' })
  title: string;

  @ApiProperty({
    example: 'Quarterly project progress report',
    description: 'Document description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '123456789-report.pdf',
    description: 'Stored filename',
  })
  filePath: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'File MIME type',
  })
  fileType: string;

  @ApiProperty({ example: 102400, description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({
    enum: DocumentStatus,
    example: DocumentStatus.COMPLETED,
    description: 'Document processing status',
  })
  status: DocumentStatus;

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

  @ApiProperty({ type: UserResponseDto, description: 'Document owner' })
  user: UserResponseDto;

  @ApiProperty({
    type: [IngestionResponseDto],
    description: 'Ingestion history',
    required: false,
  })
  ingestion?: IngestionResponseDto[];
}
