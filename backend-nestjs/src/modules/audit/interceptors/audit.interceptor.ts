import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;

        // Solo auditar métodos que modifican datos
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle().pipe(
                tap((data) => {
                    this.logAudit(req, data);
                }),
            );
        }

        return next.handle();
    }

    private async logAudit(req: any, responseData: any) {
        try {
            const user = req.user; // Asume que AuthGuard ya pobló el usuario
            const ip = req.ip || req.connection.remoteAddress;
            const agent = req.headers['user-agent'];
            const path = req.path;

            // Intentar deducir el módulo desde la URL
            // ej: /api/facturas -> facturas
            const segments = path.split('/').filter(Boolean);
            const modulo = segments.length > 1 ? segments[1] : 'general';

            // Identificar ID de entidad si está en response o params
            const entidadId = responseData?.id || req.params?.id;

            await this.auditService.create({
                usuario_id: user?.id,
                usuario_nombre: user?.nombre || user?.username || 'Anónimo',
                accion: req.method,
                modulo: modulo.toUpperCase(),
                entidad_id: entidadId,
                valor_anterior: null, // Difícil obtener genéricamente sin hacer query antes
                valor_nuevo: req.body, // Guardamos el payload enviado
                ip_address: ip,
                user_agent: agent,
            });
        } catch (error) {
            this.logger.error('Error en AuditInterceptor', error);
        }
    }
}
