import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getTenantConnection } from './tenant-connection';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const tenantSlug = req.headers['x-tenant-slug'] || req.query.tenant_slug;

        if (tenantSlug) {
            const tenantConnection = getTenantConnection(tenantSlug.toString());
            (req as any).tenantConnection = tenantConnection;
        }

        next();
    }
}