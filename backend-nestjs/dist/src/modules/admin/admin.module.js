"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const configuracion_entity_1 = require("./entities/configuracion.entity");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const contingencia_service_1 = require("./contingencia.service");
const contingencia_scheduler_1 = require("./contingencia.scheduler");
const audit_module_1 = require("../audit/audit.module");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const cliente_entity_1 = require("../clientes/entities/cliente.entity");
const backup_log_entity_1 = require("./entities/backup-log.entity");
const documento_pendiente_sri_entity_1 = require("./entities/documento-pendiente-sri.entity");
const email_log_entity_1 = require("./entities/email-log.entity");
const email_service_1 = require("./email.service");
const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...(useFirestore ? [] : [
                typeorm_1.TypeOrmModule.forFeature([factura_entity_1.Factura, producto_entity_1.Producto, cliente_entity_1.Cliente, backup_log_entity_1.BackupLog, documento_pendiente_sri_entity_1.DocumentoPendienteSRI, configuracion_entity_1.Configuracion, email_log_entity_1.EmailLog]),
            ]),
            audit_module_1.AuditModule,
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, contingencia_service_1.ContingenciaService, contingencia_scheduler_1.ContingenciaScheduler, email_service_1.EmailService],
        exports: [admin_service_1.AdminService, contingencia_service_1.ContingenciaService, email_service_1.EmailService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map