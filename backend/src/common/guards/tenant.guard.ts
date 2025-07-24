import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '@/database/entities';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/tenant.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];
    const tenantSchema = request.headers['x-tenant-schema'];
    const domain = request.headers.host;

    if (!tenantId && !tenantSchema && !domain) {
      throw new UnauthorizedException('Tenant information is required');
    }

    let tenant: Tenant;

    if (tenantId) {
      tenant = await this.tenantRepository.findOne({
        where: { id: tenantId },
      });
    } else if (tenantSchema) {
      tenant = await this.tenantRepository.findOne({
        where: { schema_name: tenantSchema },
      });
    } else if (domain) {
      tenant = await this.tenantRepository.findOne({
        where: { domain: domain },
      });
    }

    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new ForbiddenException('Tenant is not active');
    }

    request.tenant = tenant;
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
} 