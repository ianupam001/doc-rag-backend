import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: typeof mockPrismaService;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: PrismaService,
        useValue: mockPrismaService,
      },
      {
        provide: JwtService,
        useValue: {
          sign: jest.fn().mockReturnValue('mock-token'),
        },
      },
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn().mockReturnValue('mock-secret'), // Mock any required config
        },
      },
    ],
  }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password when validation succeeds', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        name: null,
        role: 'VIEWER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );

     expect(result).toEqual(expect.objectContaining({
  id: 1,
  email: 'test@example.com',
  name: null,
  role: 'VIEWER',
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
}));

    });
  });
});
