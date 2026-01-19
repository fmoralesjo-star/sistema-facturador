import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class TenancyInterceptor implements NestInterceptor {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
        private readonly cls: ClsService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return from(
            this.txHost.withTransaction(async () => {
                let tenantId = this.cls.get('TENANT_ID');

                // 1. If tenant is NOT set via Subdomain/Header, try to get it from Logic Authenticated User
                if ((!tenantId || tenantId === 'public')) {
                    const req = context.switchToHttp().getRequest();
                    // req.user is set by JwtAuthGuard (if route is protected)
                    if (req.user && req.user.empresa_id) {
                        tenantId = req.user.empresa_id.toString();
                        // Update CLS for consistency (optional but good for logs)
                        this.cls.set('TENANT_ID', tenantId);
                    }
                }

                // 2. Superuser Bypass Logic
                const req = context.switchToHttp().getRequest();
                if (req.user && (req.user.role === 'superadmin' || req.user.role === 'admin_global')) {
                    // Enable Superuser Mode
                    await this.txHost.tx.query(`SELECT set_config('app.is_superuser', 'true', true)`);
                } else if (tenantId && tenantId !== 'public') {
                    // Regular Tenant Isolation
                    await this.txHost.tx.query(`SELECT set_config('app.current_tenant', '${tenantId}', true)`);
                }

                // Continue with request
                // We must convert the Observable to Promise for withTransaction, but generic intercept return is Observable.
                // Wait, next.handle() returns Observable.
                // How to await Observable inside Promise-based transaction?
                return next.handle().toPromise();
                // Note: .toPromise() is deprecated in RxJS 7+. Use lastValueFrom.
                // But for simplicity/compat we check environment. NestJS internal usage often uses lastValueFrom.
            })
        );
    }
}
