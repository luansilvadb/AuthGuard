import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant, TenantType, TenantStatus } from '@/database/entities';
import * as migrateUtil from '@/database/migrate-schema.util';

describe('TenantService', () => {
  let service: TenantService;
  let tenantRepository: Repository<Tenant>;
  let dataSource: DataSource;

  const mockTenant: Partial<Tenant> = {
    id: 'tenant-123',
    name: 'Test Tenant',
    schema_name: 'test_tenant',
    domain: 'test.example.com',
    type: TenantType.MATRIX,
    status: TenantStatus.ACTIVE,
  };

  const mockSubTenant: Partial<Tenant> = {
    id: 'sub-tenant-123',
    name: 'Test Sub Tenant',
    schema_name: 'test_sub_tenant',
    domain: 'sub.test.example.com',
    type: TenantType.SUB_TENANT,
    status: TenantStatus.ACTIVE,
    parent_tenant_id: 'tenant-123',
  };

  const mockTenantRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(), // Adicionado para getTenantStats
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    dataSource = module.get<DataSource>(DataSource);

    jest.clearAllMocks();
    jest.spyOn(migrateUtil, 'runMigrationsForSchema').mockResolvedValue(undefined);
  });

  describe('createTenant', () => {
    it('should create a new tenant successfully', async () => {
      const tenantData = {
        name: 'New Tenant',
        schema_name: 'new_tenant',
        domain: 'new.example.com',
        type: TenantType.MATRIX,
      };

      mockTenantRepository.findOne.mockResolvedValue(null);
      mockTenantRepository.create.mockReturnValue(mockTenant);
      mockTenantRepository.save.mockResolvedValue(mockTenant);
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.createTenant(tenantData);

      expect(result).toEqual(mockTenant);
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: [
          { name: tenantData.name },
          { schema_name: tenantData.schema_name },
        ],
      });
      expect(mockTenantRepository.create).toHaveBeenCalledWith(tenantData);
      expect(mockTenantRepository.save).toHaveBeenCalledWith(mockTenant);
      // Aceita qualquer chamada de CREATE SCHEMA
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE SCHEMA'),
      );
    });

    it('deve rodar migrações após criar o schema', async () => {
      const tenantData = {
        name: 'Novo Tenant',
        schema_name: 'novo_schema',
        domain: 'novo.example.com',
        type: TenantType.MATRIX,
      };
      const novoTenant = { ...mockTenant, schema_name: 'novo_schema' };
      mockTenantRepository.findOne.mockResolvedValue(null);
      mockTenantRepository.create.mockReturnValue(novoTenant);
      mockTenantRepository.save.mockResolvedValue(novoTenant);
      mockDataSource.query.mockResolvedValue([]);

      await service.createTenant(tenantData);
      expect(migrateUtil.runMigrationsForSchema).toHaveBeenCalledWith('novo_schema');
    });

    it('deve lançar erro se a migração falhar', async () => {
      const tenantData = {
        name: 'Tenant Erro',
        schema_name: 'schema_erro',
        domain: 'erro.example.com',
        type: TenantType.MATRIX,
      };
      mockTenantRepository.findOne.mockResolvedValue(null);
      mockTenantRepository.create.mockReturnValue(mockTenant);
      mockTenantRepository.save.mockResolvedValue(mockTenant);
      mockDataSource.query.mockResolvedValue([]);
      (migrateUtil.runMigrationsForSchema as jest.Mock).mockRejectedValue(new Error('erro migração'));

      await expect(service.createTenant(tenantData)).rejects.toThrow('erro migração');
    });

    it('should throw ConflictException if tenant with same name exists', async () => {
      const tenantData = {
        name: 'Existing Tenant',
        schema_name: 'existing_tenant',
        domain: 'existing.example.com',
      };

      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.createTenant(tenantData)).rejects.toThrow(
        ConflictException,
      );
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: [
          { name: tenantData.name },
          { schema_name: tenantData.schema_name },
        ],
      });
    });
  });

  describe('createSubTenant', () => {
    it('should create a sub-tenant successfully', async () => {
      const parentTenant = { ...mockTenant, type: TenantType.MATRIX };
      const subTenantData = {
        name: 'Sub Tenant',
        schema_name: 'sub_tenant',
        domain: 'sub.example.com',
      };

      mockTenantRepository.findOne
        .mockResolvedValueOnce(parentTenant) // Parent tenant
        .mockResolvedValueOnce(null); // Check for existing sub-tenant
      mockTenantRepository.create.mockReturnValue(mockSubTenant);
      mockTenantRepository.save.mockResolvedValue(mockSubTenant);
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.createSubTenant('tenant-123', subTenantData);

      expect(result).toEqual(mockSubTenant);
      expect(mockTenantRepository.create).toHaveBeenCalledWith({
        ...subTenantData,
        type: TenantType.SUB_TENANT,
        parent_tenant_id: 'tenant-123',
      });
    });

    it('should throw NotFoundException if parent tenant not found', async () => {
      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSubTenant('invalid-id', mockSubTenant),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if parent is not a matrix tenant', async () => {
      const parentTenant = { ...mockTenant, type: TenantType.SUB_TENANT };
      mockTenantRepository.findOne.mockResolvedValue(parentTenant);

      await expect(
        service.createSubTenant('tenant-123', mockSubTenant),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getTenantHierarchy', () => {
    it('should return tenant hierarchy successfully', async () => {
      const tenantWithRelations = {
        ...mockTenant,
        parent_tenant: null,
        sub_tenants: [mockSubTenant],
      };

      mockTenantRepository.findOne.mockResolvedValue(tenantWithRelations);

      const result = await service.getTenantHierarchy('tenant-123');

      expect(result).toEqual({
        tenant: tenantWithRelations,
        parent: null,
        subTenants: [mockSubTenant],
      });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(service.getTenantHierarchy('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTenantsByParent', () => {
    it('should return sub-tenants of a parent', async () => {
      const subTenants = [mockSubTenant];
      mockTenantRepository.find.mockResolvedValue(subTenants);

      const result = await service.getTenantsByParent('tenant-123');

      expect(result).toEqual(subTenants);
      expect(mockTenantRepository.find).toHaveBeenCalledWith({
        where: { parent_tenant_id: 'tenant-123' },
      });
    });
  });

  describe('updateTenantStatus', () => {
    it('should update tenant status successfully', async () => {
      const updatedTenant = { ...mockTenant, status: TenantStatus.SUSPENDED };
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);
      mockTenantRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.updateTenantStatus(
        'tenant-123',
        TenantStatus.SUSPENDED,
      );

      expect(result).toEqual(updatedTenant);
      expect(mockTenantRepository.save).toHaveBeenCalledWith({
        ...mockTenant,
        status: TenantStatus.SUSPENDED,
      });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTenantStatus('invalid-id', TenantStatus.ACTIVE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTenantStats', () => {
    it('should return tenant statistics', async () => {
      const tenantId = 'tenant-123';
      const mockStats = {
        totalUsers: 0,
        totalSubTenants: 0,
        totalApplications: 0,
        activeSubscriptions: 0,
      };

      const mockTenantWithRelations = {
        ...mockTenant,
        users: [],
        sub_tenants: [],
        applications: [],
        subscriptions: [],
      };

      mockTenantRepository.findOne.mockResolvedValue(mockTenantWithRelations);

      const result = await service.getTenantStats(tenantId);

      expect(result).toEqual(mockStats);
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: tenantId },
        relations: ['users', 'sub_tenants', 'applications', 'subscriptions'],
      });
    });

    it('should throw NotFoundException for non-existent tenant', async () => {
      const tenantId = 'non-existent';

      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(service.getTenantStats(tenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: tenantId },
        relations: ['users', 'sub_tenants', 'applications', 'subscriptions'],
      });
    });
  });

  describe('deleteTenant', () => {
    it('should delete tenant successfully', async () => {
      const tenantId = 'tenant-123';
      const mockTenantWithSubTenants = {
        ...mockTenant,
        sub_tenants: [],
      };

      mockTenantRepository.findOne.mockResolvedValue(mockTenantWithSubTenants);
      mockTenantRepository.save.mockResolvedValue(mockTenantWithSubTenants);
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.deleteTenant(tenantId);

      expect(result).toBeUndefined();
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: tenantId },
        relations: ['sub_tenants'],
      });
      expect(mockTenantRepository.save).toHaveBeenCalledWith(mockTenantWithSubTenants);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('DROP SCHEMA'),
      );
    });

    it('should throw NotFoundException for non-existent tenant', async () => {
      const tenantId = 'non-existent';

      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteTenant(tenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: tenantId },
        relations: ['sub_tenants'],
      });
    });
  });
}); 