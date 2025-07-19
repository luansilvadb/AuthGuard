import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Software } from '../../global/entities/software.entity';
import { SoftwareLicense } from '../../tenants/entities/software-license.entity';
import { Tenant } from '../../global/entities/tenant.entity';
import { User } from '../../global/entities/user.entity';
import { getSoftwareConnection } from '../database/software-connection';
import { getTenantConnection } from '../database/tenant-connection';

export interface SoftwareRequest extends Request {
  softwareCode?: string;
  tenantSlug?: string;
  softwareConnection?: any;
  currentSoftware?: Software;
  currentTenant?: Tenant;
  currentLicense?: SoftwareLicense;
  currentUser?: User;
}

@Injectable()
export class SoftwareAccessMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Software)
    private softwareRepository: Repository<Software>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async use(req: SoftwareRequest, res: Response, next: NextFunction) {
    try {
      // 1. Extrair headers obrigatórios
      const softwareCode = req.headers['x-software-code'] as string;
      const tenantSlug = req.headers['x-tenant-slug'] as string;
      const userId = req.headers['x-user-id'] as string;

      // 2. Validar headers obrigatórios
      if (!softwareCode) {
        throw new UnauthorizedException('X-Software-Code header é obrigatório');
      }
      if (!tenantSlug) {
        throw new UnauthorizedException('X-Tenant-Slug header é obrigatório');
      }
      if (!userId) {
        throw new UnauthorizedException('X-User-Id header é obrigatório');
      }

      // 3. Verificar se o software existe e está ativo
      const software = await this.softwareRepository.findOne({
        where: { code: softwareCode, isActive: true },
      });
      if (!software) {
        throw new ForbiddenException(
          `Software '${softwareCode}' não encontrado ou inativo`,
        );
      }

      // 4. Verificar se o tenant existe
      const tenant = await this.tenantRepository.findOne({
        where: { slug: tenantSlug },
      });
      if (!tenant) {
        throw new ForbiddenException(`Tenant '${tenantSlug}' não encontrado`);
      }

      // 5. Verificar se o usuário existe
      const user = await this.userRepository.findOne({
        where: { id: parseInt(userId) },
      });
      if (!user) {
        throw new ForbiddenException(`Usuário '${userId}' não encontrado`);
      }

      // 6. Verificar se existe licença ativa para o software/tenant
      const tenantConnection = await getTenantConnection(tenantSlug);
      const licenseRepository = tenantConnection.getRepository(SoftwareLicense);

      const license = await licenseRepository.findOne({
        where: {
          tenantId: tenant.id,
          softwareId: software.id,
          status: 'active',
        },
        relations: ['tenant', 'software'],
      });

      if (!license) {
        throw new ForbiddenException(
          `Tenant '${tenantSlug}' não possui licença ativa para o software '${softwareCode}'`,
        );
      }

      // 7. Verificar se a licença não expirou
      if (license.expiresAt < new Date()) {
        throw new ForbiddenException(
          `Licença para o software '${softwareCode}' expirou em ${license.expiresAt.toISOString()}`,
        );
      }

      // 8. Verificar limite de usuários (implementação básica - pode ser expandida)
      // TODO: Implementar verificação de usuários ativos por software/tenant

      // 9. Conectar ao schema específico do software/tenant
      const softwareConnection = await getSoftwareConnection(
        softwareCode,
        tenantSlug,
      );

      // 10. Adicionar contexto ao request
      req.softwareCode = softwareCode;
      req.tenantSlug = tenantSlug;
      req.softwareConnection = softwareConnection;
      req.currentSoftware = software;
      req.currentTenant = tenant;
      req.currentLicense = license;
      req.currentUser = user;

      next();
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException(
        'Erro na verificação de acesso ao software',
      );
    }
  }
}