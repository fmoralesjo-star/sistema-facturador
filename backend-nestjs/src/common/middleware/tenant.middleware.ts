import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly cls: ClsService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const host = req.headers.host || '';
        const parts = host.split('.');
        let tenantId = 'public'; // Default tenant

        // Example logic: subdomain.domain.com -> subdomain is tenant
        // If localhost:3000 -> public
        if (parts.length > 2 && !host.includes('localhost')) {
            tenantId = parts[0];
        } else if (req.headers['x-tenant-id']) {
            // Allow explicit header for testing/API
            tenantId = req.headers['x-tenant-id'] as string;
        }

        // Identify Tenant ID (Integer) from string
        // Ideally we query the DB here (cached).
        // For now, we assume tenantId IS the ID (or we simulate lookup)
        // REALITY: We need to query users_companies where subdomain = X
        // BUT we cannot access DB easily here without injecting Service.
        // For this implementation step, passing the ID directly or mapping is placeholder.
        // We'll trust X-Tenant-ID header as integer for now or '1' if subdomain matches 'empresa1'.

        this.cls.run(() => {
            // Set tenant in CLS context
            this.cls.set('TENANT_ID', tenantId);

            // Propagate to Helper/Service that sets DB config
            // Note: With standard TypeORM pool, we can't 'SET' safely without transaction wrapper.
            // But we prepare the context for it.
            next();
        });
    }
}
