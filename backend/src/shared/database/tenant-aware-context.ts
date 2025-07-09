import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getTenantConnection } from './tenant-connection';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Make use async
    const headerTenantSlug = req.headers['x-tenant-slug'];
    const queryTenantSlug = req.query.tenant_slug;

    let tenantSlug: string | undefined;

    if (Array.isArray(headerTenantSlug)) {
      tenantSlug = headerTenantSlug[0];
    } else if (typeof headerTenantSlug === 'string') {
      tenantSlug = headerTenantSlug;
    } else if (Array.isArray(queryTenantSlug)) {
      // Garante que o elemento do array é uma string antes de atribuir
      tenantSlug =
        typeof queryTenantSlug[0] === 'string' ? queryTenantSlug[0] : undefined;
    } else if (typeof queryTenantSlug === 'string') {
      tenantSlug = queryTenantSlug;
    }

    if (tenantSlug) {
      req.tenantConnection = await getTenantConnection(tenantSlug); // Await the promise
    }

    next();
  }
}
