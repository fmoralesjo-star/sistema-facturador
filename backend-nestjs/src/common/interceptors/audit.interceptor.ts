
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // Generar o recuperar ID de transacción
        const transactionId = request.headers['x-transaction-id'] || uuidv4();
        request.headers['x-transaction-id'] = transactionId;

        const method = request.method;
        const url = request.url;
        const userId = request.user?.id || 'anon';

        // Logging solo para mutaciones (POST, PUT, DELETE, PATCH)
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            this.logger.log(`[${transactionId}] INICIO ${method} ${url} - Usuario: ${userId}`);
        }

        const now = Date.now();
        return next
            .handle()
            .pipe(
                tap(() => {
                    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
                        this.logger.log(`[${transactionId}] FINALIZADO ${method} ${url} (${Date.now() - now}ms)`);
                    }
                }),
            );
    }
}
