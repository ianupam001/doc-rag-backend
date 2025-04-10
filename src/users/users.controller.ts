import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators';
import { UserRole } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dtos';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden (Admin role required)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden (Admin role required)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const [users, total] = await Promise.all([
      this.usersService.findAll(),
      this.usersService.count(),
    ]);

    return {
      data: users,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
      totalPages: Math.ceil(total / paginationDto.limit),
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden (Admin role required)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }


  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden (Admin role required)' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiOkResponse({
    description: 'User deleted successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden (Admin role required)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
