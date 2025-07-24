import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant, TenantType, TenantStatus } from '@/database/entities';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';

describe('TenantController (e2e)', () => {
  let app: INestApplication;
  let tenantService: TenantService;

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

  const mockTenantService = {
    createTenant: jest.fn(),
    createSubTenant: jest.fn(),
    getTenantHierarchy: jest.fn(),
    getTenantsByParent: jest.fn(),
    updateTenantStatus: jest.fn(),
    deleteTenant: jest.fn(),
    getTenantStats: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(TenantGuard)
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

    tenantService = moduleFixture.get<TenantService>(TenantService);

    await app.init();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/tenants (POST)', () => {
    it('should create a tenant successfully', async () => {
      const createTenantDto = {
        name: 'New Tenant',
        schema_name: 'new_tenant',
        domain: 'new.example.com',
        type: TenantType.MATRIX,
      };

      mockTenantService.createTenant.mockResolvedValue(mockTenant);

      await request(app.getHttpServer())
        .post('/tenants')
        .send(createTenantDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mockTenant);
        });

      expect(mockTenantService.createTenant).toHaveBeenCalledWith(
        createTenantDto,
      );
    });

    it('should return 400 for invalid tenant data', async () => {
      const invalidDto = {
        name: '',
        schema_name: 'invalid schema',
      };

      mockTenantService.createTenant.mockRejectedValue(
        new BadRequestException('Invalid tenant data'),
      );

      await request(app.getHttpServer())
        .post('/tenants')
        .send(invalidDto)
        .expect(400);

      expect(mockTenantService.createTenant).toHaveBeenCalledWith(
        invalidDto,
      );
    });

    it('should return 409 for duplicate tenant', async () => {
      const createTenantDto = {
        name: 'Existing Tenant',
        schema_name: 'existing_tenant',
        domain: 'existing.example.com',
        type: TenantType.MATRIX,
      };

      mockTenantService.createTenant.mockRejectedValue(
        new ConflictException('Tenant already exists'),
      );

      await request(app.getHttpServer())
        .post('/tenants')
        .send(createTenantDto)
        .expect(409);

      expect(mockTenantService.createTenant).toHaveBeenCalledWith(
        createTenantDto,
      );
    });
  });

  describe('/tenants/:id/sub-tenants (POST)', () => {
    it('should create a sub-tenant successfully', async () => {
      const subTenantData = {
        name: 'Sub Tenant',
        schema_name: 'sub_tenant',
        domain: 'sub.example.com',
      };

      mockTenantService.createSubTenant.mockResolvedValue(mockSubTenant);

      const response = await request(app.getHttpServer())
        .post('/tenants/tenant-123/sub-tenants')
        .send(subTenantData)
        .expect(201);

      expect(response.body).toEqual(mockSubTenant);
      expect(mockTenantService.createSubTenant).toHaveBeenCalledWith(
        'tenant-123',
        subTenantData,
      );
    });
  });

  describe('/tenants/:id/hierarchy (GET)', () => {
    it('should return tenant hierarchy successfully', async () => {
      const hierarchyData = {
        tenant: mockTenant,
        parent: null,
        subTenants: [mockSubTenant],
      };

      mockTenantService.getTenantHierarchy.mockResolvedValue(hierarchyData);

      const response = await request(app.getHttpServer())
        .get('/tenants/tenant-123/hierarchy')
        .expect(200);

      expect(response.body).toEqual(hierarchyData);
      expect(mockTenantService.getTenantHierarchy).toHaveBeenCalledWith('tenant-123');
    });
  });

  describe('/tenants/:id/sub-tenants (GET)', () => {
    it('should return sub-tenants of a parent', async () => {
      const subTenants = [mockSubTenant];
      mockTenantService.getTenantsByParent.mockResolvedValue(subTenants);

      const response = await request(app.getHttpServer())
        .get('/tenants/tenant-123/sub-tenants')
        .expect(200);

      expect(response.body).toEqual(subTenants);
      expect(mockTenantService.getTenantsByParent).toHaveBeenCalledWith('tenant-123');
    });
  });

  describe('/tenants/:id/status (PATCH)', () => {
    it('should update tenant status successfully', async () => {
      const tenantId = 'tenant-123';
      const updateDto = { status: TenantStatus.ACTIVE };

      mockTenantService.updateTenantStatus.mockResolvedValue(mockTenant);

      await request(app.getHttpServer())
        .put(`/tenants/${tenantId}/status`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockTenant);
        });

      expect(mockTenantService.updateTenantStatus).toHaveBeenCalledWith(
        tenantId,
        updateDto.status,
      );
    });

    it('should return 404 for non-existent tenant', async () => {
      const tenantId = 'non-existent';
      const updateDto = { status: TenantStatus.ACTIVE };

      mockTenantService.updateTenantStatus.mockRejectedValue(
        new NotFoundException('Tenant not found'),
      );

      await request(app.getHttpServer())
        .put(`/tenants/${tenantId}/status`)
        .send(updateDto)
        .expect(404);

      expect(mockTenantService.updateTenantStatus).toHaveBeenCalledWith(
        tenantId,
        updateDto.status,
      );
    });
  });

  describe('/tenants/:id (DELETE)', () => {
    it('should delete tenant successfully', async () => {
      const tenantId = 'tenant-123';

      mockTenantService.deleteTenant.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/tenants/${tenantId}`)
        .expect(200);

      expect(mockTenantService.deleteTenant).toHaveBeenCalledWith(tenantId);
    });

    it('should return 404 for non-existent tenant', async () => {
      const tenantId = 'non-existent';

      mockTenantService.deleteTenant.mockRejectedValue(
        new NotFoundException('Tenant not found'),
      );

      await request(app.getHttpServer())
        .delete(`/tenants/${tenantId}`)
        .expect(404);

      expect(mockTenantService.deleteTenant).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('/tenants/:id/stats (GET)', () => {
    it('should return tenant statistics', async () => {
      const statsData = {
        totalUsers: 10,
        totalSubTenants: 2,
        totalApplications: 5,
        activeSubscriptions: 3,
      };

      mockTenantService.getTenantStats.mockResolvedValue(statsData);

      const response = await request(app.getHttpServer())
        .get('/tenants/tenant-123/stats')
        .expect(200);

      expect(response.body).toEqual(statsData);
      expect(mockTenantService.getTenantStats).toHaveBeenCalledWith('tenant-123');
    });
  });
}); 