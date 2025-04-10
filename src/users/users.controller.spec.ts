import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto';
import { User, UserRole } from '@prisma/client';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: jest.Mocked<UsersService>;

  // Create a complete mock user
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password', // Note: In real code, this would be hashed
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockResolvedValue({
              id: mockUser.id,
              name: mockUser.name,
              email: mockUser.email,
              role: mockUser.role,
              createdAt: mockUser.createdAt,
              updatedAt: mockUser.updatedAt,
            }),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: UserRole.ADMIN,
      };

      const result = await usersController.create(dto);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      expect(usersService.create).toHaveBeenCalledWith(dto);
    });
  });
});
