import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    example: 'Project Report',
    description: 'Document title',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'Quarterly project progress report',
    description: 'Document description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
