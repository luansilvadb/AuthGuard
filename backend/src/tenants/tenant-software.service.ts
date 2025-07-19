import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoftwareLicense } from './entities/software-license.entity';
import { Software } from '../global/entities/software.entity';
import { Tenant } from '../global/entities/tenant.entity';
import { SoftwareMigrationService } from '../shared/database/software-migration.service';
import { getTenantConnection } from '../shared/database/tenant-connection';

@Injectable()
export class TenantSoftwareService {
  constructor(
    @InjectRepository(SoftwareLicense)
    private readonly licenseRepository: Repository<SoftwareLicense>,
    @InjectRepository(Software)
    private readonly softwareRepository: Repository<Software>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly softwareMigrationService: SoftwareMigrationService,
  ) {}

  async findAll(
    tenantSlug: string,
    tenantId: number,
  ): Promise<SoftwareLicense[]> {
    const connection = await getTenantConnection(tenantSlug);
    return connection.getRepository(SoftwareLicense).find({
      where: { tenantId },
      relations: ['tenant', 'software'],
    });
  }

  async findOne(
    tenantSlug: string,
    tenantId: number,
    licenseId: number,
  ): Promise<SoftwareLicense | null> {
    const connection = await getTenantConnection(tenantSlug);
    return connection.getRepository(SoftwareLicense).findOne({
      where: { id: licenseId, tenantId },
      relations: ['tenant', 'software'],
    });
  }

  async create(
    tenantSlug: string,
    tenantId: number,
    data: Partial<SoftwareLicense>,
  ): Promise<SoftwareLicense> {
    const connection = await getTenantConnection(tenantSlug);
    const licenseRepository = connection.getRepository(SoftwareLicense);

    const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
    const software = await this.softwareRepository.findOneBy({
      id: data.softwareId,
    });

    if (!tenant || !software) {
      throw new NotFoundException('Tenant or Software not found');
    }

    const license = licenseRepository.create({
      ...data,
      tenantId: tenant.id,
      softwareId: software.id,
    });
    const savedLicense = await licenseRepository.save(license);

    await this.softwareMigrationService.provisionSoftwareSchema(
      software.code,
      tenant.slug,
    );

    return savedLicense;
  }
}