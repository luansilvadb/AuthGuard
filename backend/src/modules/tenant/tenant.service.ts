import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant, TenantType, TenantStatus } from '@/database/entities';
import { runMigrationsForSchema } from '@/database/migrate-schema.util';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly dataSource: DataSource,
  ) {}

  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    // Check if tenant with same name or schema already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: [
        { name: tenantData.name },
        { schema_name: tenantData.schema_name },
      ],
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this name or schema already exists');
    }

    const tenant = this.tenantRepository.create(tenantData);
    const savedTenant = await this.tenantRepository.save(tenant);

    // Create schema for the tenant
    await this.createTenantSchema(savedTenant.schema_name);

    return savedTenant;
  }

  async createSubTenant(parentTenantId: string, subTenantData: Partial<Tenant>): Promise<Tenant> {
    const parentTenant = await this.tenantRepository.findOne({
      where: { id: parentTenantId },
    });

    if (!parentTenant) {
      throw new NotFoundException('Parent tenant not found');
    }

    if (parentTenant.type !== TenantType.MATRIX) {
      throw new ConflictException('Only matrix tenants can have sub-tenants');
    }

    const subTenant = this.tenantRepository.create({
      ...subTenantData,
      type: TenantType.SUB_TENANT,
      parent_tenant_id: parentTenantId,
    });

    const savedSubTenant = await this.tenantRepository.save(subTenant);

    // Create schema for the sub-tenant
    await this.createTenantSchema(savedSubTenant.schema_name);

    return savedSubTenant;
  }

  async getTenantHierarchy(tenantId: string): Promise<{
    tenant: Tenant;
    parent?: Tenant;
    subTenants: Tenant[];
  }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['parent_tenant', 'sub_tenants'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      tenant,
      parent: tenant.parent_tenant,
      subTenants: tenant.sub_tenants || [],
    };
  }

  async getTenantsByParent(parentTenantId: string): Promise<Tenant[]> {
    return this.tenantRepository.find({
      where: { parent_tenant_id: parentTenantId },
    });
  }

  async updateTenantStatus(tenantId: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.status = status;
    return this.tenantRepository.save(tenant);
  }

  async deleteTenant(tenantId: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['sub_tenants'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.sub_tenants && tenant.sub_tenants.length > 0) {
      throw new ConflictException('Cannot delete tenant with sub-tenants');
    }

    // Drop the tenant schema
    await this.dropTenantSchema(tenant.schema_name);

    // Soft delete the tenant
    tenant.deleted_at = new Date();
    await this.tenantRepository.save(tenant);
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    // Após criar o schema, rodar as migrações nele
    await runMigrationsForSchema(schemaName);
  }

  private async dropTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  }

  async getTenantStats(tenantId: string): Promise<{
    totalUsers: number;
    totalSubTenants: number;
    totalApplications: number;
    activeSubscriptions: number;
  }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['users', 'sub_tenants', 'applications', 'subscriptions'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      totalUsers: tenant.users?.length || 0,
      totalSubTenants: tenant.sub_tenants?.length || 0,
      totalApplications: tenant.applications?.length || 0,
      activeSubscriptions: tenant.subscriptions?.filter(sub => sub.status === 'active').length || 0,
    };
  }
} 