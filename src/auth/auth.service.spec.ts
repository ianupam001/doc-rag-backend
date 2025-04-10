import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

// Create a strongly typed mock
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

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

      // Properly typed mock implementation
      prismaService.user.findUnique.mockImplementation(() =>
        Promise.resolve(mockUser),
      );

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: null,
        role: 'USER',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });
});
