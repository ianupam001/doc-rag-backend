import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDocumentDto {
  @ApiProperty({
    example: 'Updated Project Report',
    description: 'Document title',
    minLength: 3,
    required: false,
  })
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Updated quarterly project progress report',
    description: 'Document description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
