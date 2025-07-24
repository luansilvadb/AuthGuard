import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

import { TenantGuard } from './tenant.guard';
import { Tenant, TenantStatus } from '@/database/entities';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let tenantRepository: Repository<Tenant>;

  const mockTenant: Partial<Tenant> = {
    id: 'tenant-123',
    name: 'Test Tenant',
    schema_name: 'test_tenant',
    domain: 'test.example.com',
    status: TenantStatus.ACTIVE,
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          'x-tenant-id': 'tenant-123',
        },
      }),
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for valid tenant ID', async () => {
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
      });
    });

    it('should return true for valid tenant schema', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-tenant-schema': 'test_tenant',
            },
          }),
        }),
      } as ExecutionContext;

      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { schema_name: 'test_tenant' },
      });
    });

    it('should return true for valid domain', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              host: 'test.example.com',
            },
          }),
        }),
      } as ExecutionContext;

      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { domain: 'test.example.com' },
      });
    });

    it('should set tenant in request', async () => {
      const mockRequest: any = {
        headers: {
          'x-tenant-id': 'tenant-123',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      await guard.canActivate(mockContext);

      expect(mockRequest.tenant).toEqual(mockTenant);
    });

    it('should throw UnauthorizedException when no tenant information is provided', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Tenant information is required',
      );
    });

    it('should throw UnauthorizedException for invalid tenant ID', async () => {
      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Invalid tenant',
      );
    });

    it('should throw UnauthorizedException for invalid tenant schema', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-tenant-schema': 'invalid_schema',
            },
          }),
        }),
      } as ExecutionContext;

      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid domain', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              host: 'invalid.example.com',
            },
          }),
        }),
      } as ExecutionContext;

      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException for inactive tenant', async () => {
      const inactiveTenant = {
        ...mockTenant,
        status: TenantStatus.INACTIVE,
      };

      mockTenantRepository.findOne.mockResolvedValue(inactiveTenant);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Tenant is not active',
      );
    });

    it('should throw ForbiddenException for suspended tenant', async () => {
      const suspendedTenant = {
        ...mockTenant,
        status: TenantStatus.SUSPENDED,
      };

      mockTenantRepository.findOne.mockResolvedValue(suspendedTenant);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for pending tenant', async () => {
      const pendingTenant = {
        ...mockTenant,
        status: TenantStatus.PENDING,
      };

      mockTenantRepository.findOne.mockResolvedValue(pendingTenant);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should prioritize tenant ID over schema', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-tenant-id': 'tenant-123',
              'x-tenant-schema': 'test_tenant',
            },
          }),
        }),
      } as ExecutionContext;

      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      await guard.canActivate(mockContext);

      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
      });
      expect(mockTenantRepository.findOne).not.toHaveBeenCalledWith({
        where: { schema_name: 'test_tenant' },
      });
    });

    it('should prioritize tenant schema over domain', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-tenant-schema': 'test_tenant',
              host: 'test.example.com',
            },
          }),
        }),
      } as ExecutionContext;

      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      await guard.canActivate(mockContext);

      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { schema_name: 'test_tenant' },
      });
      expect(mockTenantRepository.findOne).not.toHaveBeenCalledWith({
        where: { domain: 'test.example.com' },
      });
    });
  });
}); 