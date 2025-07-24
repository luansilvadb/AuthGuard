import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { UserService } from './user.service';
import { User, UserRole, UserStatus } from '@/database/entities';
import { Tenant, TenantType, TenantStatus } from '@/database/entities';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let configService: ConfigService;

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

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
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

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        password: 'password123',
      };
      const tenantId = 'tenant-123';

      mockUserRepository.findOne.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue(12);
      mockUserRepository.create.mockReturnValue({
        ...userData,
        password: 'hashedPassword',
        tenant_id: tenantId,
      });
      mockUserRepository.save.mockResolvedValue({
        ...userData,
        id: 'new-user-123',
        password: 'hashedPassword',
        tenant_id: tenantId,
      });

      const result = await service.createUser(userData, tenantId);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: userData.email, tenant_id: tenantId },
      });
    });

    it('should throw ConflictException for existing email in tenant', async () => {
      const userData = {
        email: 'existing@example.com',
        first_name: 'New',
        last_name: 'User',
      };
      const tenantId = 'tenant-123';

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createUser(userData, tenantId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password when provided', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
      };
      const tenantId = 'tenant-123';

      mockUserRepository.findOne.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue(12);
      mockUserRepository.create.mockReturnValue({
        ...userData,
        password: 'hashedPassword',
        tenant_id: tenantId,
      });
      mockUserRepository.save.mockResolvedValue({
        ...userData,
        password: 'hashedPassword',
        tenant_id: tenantId,
      });

      await service.createUser(userData, tenantId);

      expect(mockConfigService.get).toHaveBeenCalledWith('app.bcryptRounds', 12);
    });
  });

  describe('getUsersByTenant', () => {
    it('should return paginated users for tenant', async () => {
      const tenantId = 'tenant-123';
      const page = 1;
      const limit = 10;
      const users = [mockUser];
      const total = 1;

      mockUserRepository.findAndCount.mockResolvedValue([users, total]);

      const result = await service.getUsersByTenant(tenantId, page, limit);

      expect(result.users).toEqual(users);
      expect(result.total).toBe(total);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
      expect(result.totalPages).toBe(1);
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenant_id: tenantId },
        skip: 0,
        take: limit,
        order: { created_at: 'DESC' },
      });
    });

    it('should use default pagination values', async () => {
      const tenantId = 'tenant-123';
      const users = [mockUser];
      const total = 1;

      mockUserRepository.findAndCount.mockResolvedValue([users, total]);

      await service.getUsersByTenant(tenantId);

      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenant_id: tenantId },
        skip: 0,
        take: 10,
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id and tenant', async () => {
      const userId = 'user-123';
      const tenantId = 'tenant-123';

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById(userId, tenantId);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId, tenant_id: tenantId },
        relations: ['tenant'],
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'invalid-user';
      const tenantId = 'tenant-123';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserById(userId, tenantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await service.updateUser(userId, tenantId, updateData);

      expect(result.first_name).toBe(updateData.first_name);
      expect(result.last_name).toBe(updateData.last_name);
    });

    it('should throw ConflictException for existing email', async () => {
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const updateData = {
        email: 'existing@example.com',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // First call for getUserById
      mockUserRepository.findOne.mockResolvedValueOnce({ ...mockUser, id: 'other-user' }); // Second call for email check

      await expect(
        service.updateUser(userId, tenantId, updateData),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password when updating', async () => {
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const updateData = {
        password: 'newPassword123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockConfigService.get.mockReturnValue(12);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'hashedNewPassword',
      });

      await service.updateUser(userId, tenantId, updateData);

      expect(mockConfigService.get).toHaveBeenCalledWith('app.bcryptRounds', 12);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully', async () => {
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const newStatus = UserStatus.SUSPENDED;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        status: newStatus,
      });

      const result = await service.updateUserStatus(userId, tenantId, newStatus);

      expect(result.status).toBe(newStatus);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const newRole = UserRole.ADMIN;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        role: newRole,
      });

      const result = await service.updateUserRole(userId, tenantId, newRole);

      expect(result.role).toBe(newRole);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const userId = 'user-123';
      const tenantId = 'tenant-123';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        deleted_at: new Date(),
      });

      await service.deleteUser(userId, tenantId);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(Date),
        }),
      );
    });
  });

  describe('getUsersByRole', () => {
    it('should return users by role', async () => {
      const tenantId = 'tenant-123';
      const role = UserRole.ADMIN;
      const users = [mockUser];

      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.getUsersByRole(tenantId, role);

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: tenantId, role, deleted_at: null },
      });
    });
  });

  describe('getActiveUsers', () => {
    it('should return active users', async () => {
      const tenantId = 'tenant-123';
      const users = [mockUser];

      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.getActiveUsers(tenantId);

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          tenant_id: tenantId,
          status: UserStatus.ACTIVE,
          deleted_at: null,
        },
      });
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const tenantId = 'tenant-123';
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { role: 'admin', count: '2' },
          { role: 'user', count: '8' },
        ]),
      };

      mockUserRepository.count
        .mockResolvedValueOnce(10) // totalUsers
        .mockResolvedValueOnce(8) // activeUsers
        .mockResolvedValueOnce(1) // pendingUsers
        .mockResolvedValueOnce(1); // suspendedUsers

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUserStats(tenantId);

      expect(result.total).toBe(10);
      expect(result.active).toBe(8);
      expect(result.pending).toBe(1);
      expect(result.suspended).toBe(1);
      expect(result.byRole).toEqual([
        { role: 'admin', count: '2' },
        { role: 'user', count: '8' },
      ]);
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const tenantId = 'tenant-123';
      const query = 'test';
      const users = [mockUser];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchUsers(tenantId, query);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.tenant_id = :tenantId',
        { tenantId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.deleted_at IS NULL',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.first_name ILIKE :query OR user.last_name ILIKE :query OR user.email ILIKE :query)',
        { query: `%${query}%` },
      );
    });
  });
}); 