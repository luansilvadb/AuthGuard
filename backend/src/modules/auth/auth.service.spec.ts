import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService, JwtPayload } from './auth.service';
import { User, UserStatus, UserRole } from '@/database/entities';
import { Tenant, TenantType, TenantStatus } from '@/database/entities';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userRepository: Repository<User>;

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    password: 'hashedPassword',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    tenant_id: 'tenant-123',
    tenant: {
      id: 'tenant-123',
      name: 'Test Tenant',
      schema_name: 'test_tenant',
      domain: 'test.example.com',
      type: TenantType.MATRIX,
      status: TenantStatus.ACTIVE,
    } as Tenant,
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.validateUser(email, password);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        relations: ['tenant'],
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser('invalid@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(
        service.validateUser('test@example.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
        status: UserStatus.INACTIVE,
      });

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should validate user with tenantId', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const tenantId = 'tenant-123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await service.validateUser(email, password, tenantId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email, tenant_id: tenantId },
        relations: ['tenant'],
      });
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const mockToken = 'jwt-token';
      const mockPayload: JwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: mockUser.tenant_id,
        tenantSchema: mockUser.tenant.schema_name,
      };

      mockJwtService.sign.mockReturnValue(mockToken);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.login(mockUser as User);

      expect(result.access_token).toBe(mockToken);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(mockJwtService.sign).toHaveBeenCalledWith(mockPayload);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        first_name: 'New',
        last_name: 'User',
        email: 'newuser@example.com',
        password: 'password123',
        tenant_id: 'tenant-123',
      };

      const hashedPassword = 'hashedPassword';
      const newUser = { ...userData, password: hashedPassword };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue(12);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue({
        ...newUser,
        id: 'new-user-123',
        status: UserStatus.PENDING,
      });

      const result = await service.register(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.status).toBe(UserStatus.PENDING);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
    });

    it('should throw BadRequestException for existing email', async () => {
      const userData = {
        first_name: 'New',
        last_name: 'User',
        email: 'existing@example.com',
        password: 'password123',
        tenant_id: 'tenant-123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(userData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token for valid user', async () => {
      const userId = 'user-123';
      const mockToken = 'new-jwt-token';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.refreshToken(userId);

      expect(result.access_token).toBe(mockToken);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['tenant'],
      });
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      const userId = 'invalid-user';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const userId = 'user-123';

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        status: UserStatus.INACTIVE,
      });

      await expect(service.refreshToken(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user-123';
      const currentPassword = 'oldPassword';
      const newPassword = 'newPassword';
      const hashedCurrentPassword = await bcrypt.hash(currentPassword, 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedCurrentPassword,
      });
      mockConfigService.get.mockReturnValue(12);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      expect(result.message).toBe('Password changed successfully');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const userId = 'invalid-user';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, 'oldPassword', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      const userId = 'user-123';
      const currentPassword = 'wrongPassword';
      const newPassword = 'newPassword';
      const hashedCurrentPassword = await bcrypt.hash('correctPassword', 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedCurrentPassword,
      });

      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(BadRequestException);
    });
  });
}); 