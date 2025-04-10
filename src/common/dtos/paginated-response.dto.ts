import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/users/dto';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data: UserResponseDto;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;
}
