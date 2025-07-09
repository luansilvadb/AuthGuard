import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../global/entities/tenant.entity';
import { User } from '../global/entities/user.entity';
import { getTenantConnection } from '../shared/database/tenant-connection';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  async createTenant(userId: number, name: string): Promise<Tenant> {
    const user = await this.dataSource
      .getRepository(User)
      .findOneBy({ id: userId });

    const tenantSlug = `tenant-${Date.now()}`;

    const tenant = this.tenantRepository.create({
      name,
      slug: tenantSlug,
      owner: user,
    });

    await this.tenantRepository.save(tenant);
    await this.createTenantSchema(tenantSlug);

    return tenant;
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    const tenantConnection = await getTenantConnection(schemaName); // Await the promise

    // Garante que a conexão está inicializada
    if (!tenantConnection.isInitialized) {
      await tenantConnection.initialize();
    }

    await tenantConnection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);
  }
}
