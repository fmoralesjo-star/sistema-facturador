"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const audit_service_1 = require("../audit.service");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    constructor(auditService) {
        this.auditService = auditService;
        this.logger = new common_1.Logger(AuditInterceptor_1.name);
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle().pipe((0, operators_1.tap)((data) => {
                this.logAudit(req, data);
            }));
        }
        return next.handle();
    }
    async logAudit(req, responseData) {
        try {
            const user = req.user;
            const ip = req.ip || req.connection.remoteAddress;
            const agent = req.headers['user-agent'];
            const path = req.path;
            const segments = path.split('/').filter(Boolean);
            const modulo = segments.length > 1 ? segments[1] : 'general';
            const entidadId = responseData?.id || req.params?.id;
            await this.auditService.create({
                usuario_id: user?.id,
                usuario_nombre: user?.nombre || user?.username || 'Anónimo',
                accion: req.method,
                modulo: modulo.toUpperCase(),
                entidad_id: entidadId,
                valor_anterior: null,
                valor_nuevo: req.body,
                ip_address: ip,
                user_agent: agent,
            });
        }
        catch (error) {
            this.logger.error('Error en AuditInterceptor', error);
        }
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map