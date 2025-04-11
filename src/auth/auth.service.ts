import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload, Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { RegisterDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomForbiddenException } from 'src/common/execeptions';

@Injectable()
export class AuthService {
  private env: string;
  private isProduction: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {
    this.env = config.get<string>('ENV') || 'STAGE';
    this.isProduction = this.env === 'PROD' || this.env === 'STAGE';
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) return null;

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return null;

      // Exclude password before returning
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new InternalServerErrorException('Error while validating user');
    }
  }

  async validateUserById(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error validating user');
    }
  }

  async login(user: { id: number; email: string; role: UserRole }) {
    try {
      const tokens = await this.getTokens(user.id, user.email, [user.role]);
      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      throw new InternalServerErrorException('Login failed');
    }
  }

  async register(dto: RegisterDto) {
    try {
      const hashedPassword = await this.hashData(dto.password);

      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: UserRole.VIEWER,
        },
      });

      const tokens = await this.getTokens(newUser.id, newUser.email, [
        newUser.role,
      ]);

      return {
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        tokens,
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Email already exists');
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async refreshToken(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new CustomForbiddenException('User not authenticated');
    }

    const rtPayload = await this.verifyToken(refreshToken);

    if (!rtPayload) {
      throw new CustomForbiddenException('Refresh token malformed');
    }

    const tokens = await this.getTokens(user.id, user.email, [user.role]);

    return tokens;
  }

  // helper function

  async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async getTokens(
    userId: number,
    email: string,
    roles: UserRole[] = [UserRole.VIEWER],
  ): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      identification: email,
      role: roles,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET')!,
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET')!,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('RT_SECRET'),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new CustomForbiddenException('Token has expired');
      }
      throw new CustomForbiddenException('Invalid Token!');
    }
  }
}
