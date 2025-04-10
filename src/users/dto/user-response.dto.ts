import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
    required: false,
  })
  name?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.VIEWER,
    description: 'User UserRole',
  })
  UserRole: UserRole;

  @ApiProperty({
    example: '2023-05-15T10:00:00Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-15T10:00:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
