import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoftwareLicense } from './entities/software-license.entity';
import { TenantSoftwareController } from './tenant-software.controller';
import { TenantSoftwareService } from './tenant-software.service';
import { SoftwareMigrationService } from '../shared/database/software-migration.service';
import { Software } from '../global/entities/software.entity';
import { Tenant } from '../global/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SoftwareLicense, Software, Tenant])],
  controllers: [TenantSoftwareController],
  providers: [TenantSoftwareService, SoftwareMigrationService],
  exports: [TenantSoftwareService],
})
export class TenantSoftwareModule {}