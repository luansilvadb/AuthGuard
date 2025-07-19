import { TenantSoftwareModule } from './tenant-software.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../global/entities/tenant.entity';
import { TenantService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { TenantSchemaController } from './tenant-schema.controller';
import { TenantMigrationService } from '../shared/database/tenant-migration.service';
import { TenantSchemaManagerService } from '../shared/database/tenant-schema-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), TenantSoftwareModule],
  providers: [
    TenantService,
    TenantMigrationService,
    TenantSchemaManagerService,
  ],
  controllers: [TenantsController, TenantSchemaController],
  exports: [TenantService],
})
export class TenantsModule {}
