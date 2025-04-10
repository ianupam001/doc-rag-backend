import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomForbiddenException } from 'src/common/execeptions';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      return await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          name: createUserDto.name,
          role: createUserDto.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new CustomForbiddenException('Email already exists');
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      await this.findOne(id);
      
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id); // Confirm user exists

      return await this.prisma.user.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async count(where?: any): Promise<number> {
    try {
      return await this.prisma.user.count({ where });
    } catch (error) {
      throw new InternalServerErrorException('Failed to count users');
    }
  }
}
