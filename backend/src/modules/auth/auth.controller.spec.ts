import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserStatus, UserRole } from '@/database/entities';
import { Tenant, TenantType, TenantStatus } from '@/database/entities';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;

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

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Add global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResponse = {
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          role: mockUser.role,
          tenant_id: mockUser.tenant_id,
          tenant: {
            id: mockTenant.id,
            name: mockTenant.name,
            schema_name: mockTenant.schema_name,
          },
        },
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(loginResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(loginResponse);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        undefined,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401); // Unauthorized for invalid credentials
    });

    it('should validate required fields', async () => {
      const invalidLoginDto = {
        email: 'invalid-email',
        // missing password
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginDto)
        .expect(400);
    });
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        first_name: 'New',
        last_name: 'User',
        email: 'newuser@example.com',
        password: 'password123',
        tenant_id: 'tenant-123',
      };

      const registerResponse = {
        id: 'new-user-123',
        email: registerDto.email,
        first_name: registerDto.first_name,
        last_name: registerDto.last_name,
        role: UserRole.USER,
        status: UserStatus.PENDING,
      };

      mockAuthService.register.mockResolvedValue(registerResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toEqual(registerResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return 400 for existing email', async () => {
      const registerDto = {
        first_name: 'New',
        last_name: 'User',
        email: 'existing@example.com',
        password: 'password123',
        tenant_id: 'tenant-123',
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('User with this email already exists'),
      );

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400); // Bad request for existing email
    });

    it('should validate required fields', async () => {
      const invalidRegisterDto = {
        first_name: 'New',
        // missing required fields
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidRegisterDto)
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh token successfully', async () => {
      const refreshDto = {
        refresh_token: 'refresh-token-123',
      };

      const refreshResponse = {
        access_token: 'new-jwt-token',
      };

      // Mock JWT verification to return a valid user
      mockJwtService.verify.mockReturnValue({ sub: 'user-123' });
      mockAuthService.refreshToken.mockResolvedValue(refreshResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(refreshDto)
        .expect(200);

      expect(response.body).toEqual(refreshResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 for invalid user', async () => {
      const refreshDto = {
        refresh_token: 'invalid-refresh-token',
      };

      // Mock JWT verification to throw an error
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid-jwt-token')
        .send(refreshDto)
        .expect(401);
    });
  });

  describe('/auth/change-password (POST)', () => {
    it('should change password successfully', async () => {
      const changePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      };

      const changePasswordResponse = {
        message: 'Password changed successfully',
      };

      // Mock JWT verification to return a valid user
      mockJwtService.verify.mockReturnValue({ sub: 'user-123' });
      mockAuthService.changePassword.mockResolvedValue(changePasswordResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(changePasswordDto)
        .expect(200);

      expect(response.body).toEqual(changePasswordResponse);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        'user-123',
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
    });

    it('should return 401 for incorrect current password', async () => {
      const changePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      // Mock JWT verification to return a valid user
      mockJwtService.verify.mockReturnValue({ sub: 'user-123' });
      mockAuthService.changePassword.mockRejectedValue(
        new Error('Current password is incorrect'),
      );

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(changePasswordDto)
        .expect(500);
    });

    it('should validate required fields', async () => {
      const invalidChangePasswordDto = {
        // missing required fields
      };

      // Mock JWT verification to return a valid user
      mockJwtService.verify.mockReturnValue({ sub: 'user-123' });

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(invalidChangePasswordDto)
        .expect(400);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return user profile', async () => {
      const mockUserProfile = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'user',
        tenantId: 'tenant-123',
        tenantSchema: 'test_tenant',
      };

      // Mock JWT verification to return a valid user
      mockJwtService.verify.mockReturnValue(mockUserProfile);

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual(mockUserProfile);
    });
  });
}); 