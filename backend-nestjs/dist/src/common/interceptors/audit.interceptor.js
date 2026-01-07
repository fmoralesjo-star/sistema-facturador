"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const uuid_1 = require("uuid");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    constructor() {
        this.logger = new common_1.Logger(AuditInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const transactionId = request.headers['x-transaction-id'] || (0, uuid_1.v4)();
        request.headers['x-transaction-id'] = transactionId;
        const method = request.method;
        const url = request.url;
        const userId = request.user?.id || 'anon';
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            this.logger.log(`[${transactionId}] INICIO ${method} ${url} - Usuario: ${userId}`);
        }
        const now = Date.now();
        return next
            .handle()
            .pipe((0, operators_1.tap)(() => {
            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
                this.logger.log(`[${transactionId}] FINALIZADO ${method} ${url} (${Date.now() - now}ms)`);
            }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map