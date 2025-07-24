import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserRole, UserStatus } from '@/database/entities';
import { Tenant, TenantType, TenantStatus } from '@/database/entities';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { DataSource } from 'typeorm';
import { TenantSchemaInterceptor } from '@/common/interceptors/tenant-schema.interceptor';
import { RolesGuard } from '@/common/guards/tenant.guard';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;

  const mockTenant: Partial<Tenant> = {
    id: 'tenant-123',
    name: 'Test Tenant',
    schema_name: 'test_tenant',
    domain: 'test.example.com',
    type: TenantType.MATRIX,
    status: TenantStatus.ACTIVE,
  };

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    password: 'hashedPassword',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    tenant_id: 'tenant-123',
    tenant: mockTenant as Tenant,
  };

  const mockUserService = {
    createUser: jest.fn(),
    findAllUsers: jest.fn(),
    findUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getUserStats: jest.fn(),
    getUsersByTenant: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: TenantSchemaInterceptor,
          useValue: { intercept: jest.fn((ctx, next) => next.handle()) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Add global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    userService = moduleFixture.get<UserService>(UserService);

    await app.init();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        first_name: 'New',
        last_name: 'User',
        email: 'newuser@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('x-tenant-id', 'tenant-123')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual(mockUser);
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData, 'tenant-123');
    });

    it('should validate required fields', async () => {
      const invalidUserData = {
        // missing required fields
      };

      mockUserService.createUser.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await request(app.getHttpServer())
        .post('/users')
        .set('x-tenant-id', 'tenant-123')
        .send(invalidUserData)
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users for tenant', async () => {
      const users = [mockUser];
      const expectedResponse = {
        users,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUserService.getUsersByTenant.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('x-tenant-id', 'tenant-123')
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockUserService.getUsersByTenant).toHaveBeenCalledWith('tenant-123', NaN, NaN);
    });

    it('should return filtered users', async () => {
      const users = [mockUser];
      const expectedResponse = {
        users,
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      };

      mockUserService.getUsersByTenant.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .get('/users?page=2&limit=5')
        .set('x-tenant-id', 'tenant-123')
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockUserService.getUsersByTenant).toHaveBeenCalledWith('tenant-123', 2, 5);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return user by id', async () => {
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get('/users/user-123')
        .set('x-tenant-id', 'tenant-123')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(mockUserService.getUserById).toHaveBeenCalledWith('user-123', 'tenant-123');
    });
  });

  describe('/users/:id (PUT)', () => {
    it('should update user successfully', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        role: 'admin',
      };
      const updatedUser = { ...mockUser, ...updateData };

      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .put('/users/user-123')
        .set('x-tenant-id', 'tenant-123')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedUser);
      expect(mockUserService.updateUser).toHaveBeenCalledWith('user-123', 'tenant-123', updateData);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete user successfully', async () => {
      mockUserService.deleteUser.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/users/user-123')
        .set('x-tenant-id', 'tenant-123')
        .expect(200);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user-123', 'tenant-123');
    });
  });

  describe('/users/stats (GET)', () => {
    it('should return user statistics', async () => {
      const statsData = {
        totalUsers: 100,
        activeUsers: 85,
        inactiveUsers: 10,
        suspendedUsers: 5,
        usersByRole: {
          admin: 10,
          user: 90,
        },
      };

      mockUserService.getUserStats.mockResolvedValue(statsData);

      const response = await request(app.getHttpServer())
        .get('/users/stats')
        .set('x-tenant-id', 'tenant-123')
        .expect(200);

      expect(response.body).toEqual(statsData);
      expect(mockUserService.getUserStats).toHaveBeenCalledWith('tenant-123');
    });
  });
}); 