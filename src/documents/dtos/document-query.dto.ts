import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class DocumentQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Items per page',
    required: false,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    enum: DocumentStatus,
    description: 'Filter by document status',
    required: false,
  })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @ApiProperty({
    example: 'report',
    description: 'Search term for title or description',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
