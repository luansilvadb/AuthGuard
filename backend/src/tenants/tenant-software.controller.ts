import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { getTenantConnection } from '../shared/database/tenant-connection';
import { SoftwareLicense } from './entities/software-license.entity';
import { SoftwareMigrationService } from '../shared/database/software-migration.service';
import { Software } from '../global/entities/software.entity';
import { Tenant } from '../global/entities/tenant.entity';

@Controller('tenant-software')
export class TenantSoftwareController {
  constructor(
    private readonly softwareMigrationService: SoftwareMigrationService,
  ) {}

  private async getValidatedTenantConnection(req: Request) {
    if (!req.tenantSlug) {
      throw new NotFoundException('Tenant slug not found in request');
    }
    return getTenantConnection(req.tenantSlug);
  }

  @Get(':tenantId/licenses')
  async findAll(
    @Param('tenantId') tenantId: number,
    @Req() req: Request,
  ): Promise<SoftwareLicense[]> {
    const connection = await this.getValidatedTenantConnection(req);
    return connection.getRepository(SoftwareLicense).find({
      where: { tenantId },
      relations: ['tenant', 'software'],
    });
  }

  @Get(':tenantId/licenses/:id')
  async findOne(
    @Param('tenantId') tenantId: number,
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<SoftwareLicense | null> {
    const connection = await this.getValidatedTenantConnection(req);
    return connection.getRepository(SoftwareLicense).findOne({
      where: { id, tenantId },
      relations: ['tenant', 'software'],
    });
  }

  @Post(':tenantId/licenses')
  async create(
    @Param('tenantId') tenantId: number,
    @Body() data: Partial<SoftwareLicense>,
    @Req() req: Request,
  ): Promise<SoftwareLicense> {
    const connection = await this.getValidatedTenantConnection(req);
    const licenseRepository = connection.getRepository(SoftwareLicense);
    const softwareRepository = connection.getRepository(Software);
    const tenantRepository = connection.getRepository(Tenant);

    const tenant = await tenantRepository.findOneBy({ id: tenantId });
    const software = await softwareRepository.findOneBy({
      id: data.softwareId,
    });

    if (!tenant || !software) {
      throw new Error('Tenant or Software not found');
    }

    const license = licenseRepository.create({
      ...data,
      tenantId: tenant.id,
      softwareId: software.id,
    });
    const savedLicense = await licenseRepository.save(license);

    // Provisionar o schema do software para o tenant
    await this.softwareMigrationService.provisionSoftwareSchema(
      software.code,
      tenant.slug,
    );

    return savedLicense;
  }
}