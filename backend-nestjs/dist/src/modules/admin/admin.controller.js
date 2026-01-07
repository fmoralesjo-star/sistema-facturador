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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const contingencia_service_1 = require("./contingencia.service");
const email_service_1 = require("./email.service");
let AdminController = class AdminController {
    constructor(adminService, contingenciaService, emailService) {
        this.adminService = adminService;
        this.contingenciaService = contingenciaService;
        this.emailService = emailService;
    }
    getEstadisticas() {
        return this.adminService.getEstadisticas();
    }
    getActividad() {
        return this.adminService.getActividad();
    }
    getConfiguracion() {
        return this.adminService.getConfiguracion();
    }
    updateConfiguracion(configuracion) {
        return this.adminService.updateConfiguracion(configuracion);
    }
    validateConfiguration() {
        return this.adminService.validateConfiguration();
    }
    async getBackups() {
        try {
            return await this.adminService.getBackups();
        }
        catch (e) {
            console.error('Controller Crash (getBackups):', e);
            return { success: false, message: 'CRASH: ' + e.message };
        }
    }
    async createBackup() {
        try {
            return await this.adminService.createBackup();
        }
        catch (e) {
            console.error('Controller Crash (createBackup):', e);
            return { success: false, message: 'CRASH: ' + e.message };
        }
    }
    restaurarBackup(body) {
        return this.adminService.restaurarBackup(body.archivo);
    }
    limpiarDatos(body) {
        return this.adminService.limpiarDatos(body.tipo, body.dias);
    }
    getReportes(tipo, fechaInicio, fechaFin) {
        return this.adminService.getReportes(tipo, fechaInicio, fechaFin);
    }
    getSystemHealth() {
        return this.adminService.getSystemHealth();
    }
    async getSystemResources() {
        try {
            return await this.adminService.getSystemResources();
        }
        catch (e) {
            console.error('Controller Crash (getSystemResources):', e);
            return { success: false, message: 'CRASH: ' + e.message };
        }
    }
    async clearMemory() {
        try {
            return await this.adminService.clearMemory();
        }
        catch (e) {
            console.error('Controller Crash (clearMemory):', e);
            return { success: false, message: 'CRASH: ' + e.message };
        }
    }
    async getSRIStatus() {
        try {
            return await this.adminService.checkSRIStatus();
        }
        catch (e) {
            console.error('Controller Crash (getSRIStatus):', e);
            return { overall: 'offline', error: e.message };
        }
    }
    async getDocumentosPendientes(tipo, estado) {
        try {
            return await this.contingenciaService.obtenerDocumentosPendientes({ tipo, estado });
        }
        catch (e) {
            console.error('Error obteniendo documentos pendientes:', e);
            return { error: e.message };
        }
    }
    async getContadorDocumentosRepresados() {
        try {
            return await this.contingenciaService.obtenerContadorDocumentosRepresados();
        }
        catch (e) {
            console.error('Error obteniendo contador:', e);
            return { total: 0, facturas: 0, notasCredito: 0, anulaciones: 0, retenciones: 0 };
        }
    }
    async reintentarEnvio(id) {
        try {
            return await this.contingenciaService.reintentarEnvioDocumento(parseInt(id, 10));
        }
        catch (e) {
            console.error('Error reintentando envío:', e);
            return { exito: false, mensaje: e.message };
        }
    }
    async procesarColaContingencia() {
        try {
            return await this.contingenciaService.procesarColaContingencia();
        }
        catch (e) {
            console.error('Error procesando cola:', e);
            return { procesados: 0, exitosos: 0, fallidos: 0, errores: [e.message] };
        }
    }
    async testSmtpConnection(config) {
        try {
            return await this.adminService.testSmtpConnection(config);
        }
        catch (e) {
            console.error('Test SMTP Error:', e);
            return { success: false, message: e.message };
        }
    }
    async getEmails(limit) {
        return this.emailService.obtenerLogs(limit || 50);
    }
    async retryEmail(id) {
        return this.emailService.reintentar(parseInt(id, 10));
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('estadisticas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getEstadisticas", null);
__decorate([
    (0, common_1.Get)('actividad'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getActividad", null);
__decorate([
    (0, common_1.Get)('configuracion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getConfiguracion", null);
__decorate([
    (0, common_1.Put)('configuracion'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateConfiguracion", null);
__decorate([
    (0, common_1.Get)('validate-config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "validateConfiguration", null);
__decorate([
    (0, common_1.Get)('backups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBackups", null);
__decorate([
    (0, common_1.Post)('backup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Post)('restaurar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "restaurarBackup", null);
__decorate([
    (0, common_1.Post)('limpiar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "limpiarDatos", null);
__decorate([
    (0, common_1.Get)('reportes'),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, common_1.Query)('fecha_inicio')),
    __param(2, (0, common_1.Query)('fecha_fin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getReportes", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('resources'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemResources", null);
__decorate([
    (0, common_1.Post)('clear-memory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "clearMemory", null);
__decorate([
    (0, common_1.Get)('sri-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSRIStatus", null);
__decorate([
    (0, common_1.Get)('documentos-pendientes'),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDocumentosPendientes", null);
__decorate([
    (0, common_1.Get)('contador-documentos-represados'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getContadorDocumentosRepresados", null);
__decorate([
    (0, common_1.Post)('reintentar-envio/:id'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reintentarEnvio", null);
__decorate([
    (0, common_1.Post)('procesar-cola-contingencia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "procesarColaContingencia", null);
__decorate([
    (0, common_1.Post)('test-smtp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "testSmtpConnection", null);
__decorate([
    (0, common_1.Get)('emails'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getEmails", null);
__decorate([
    (0, common_1.Post)('emails/:id/retry'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "retryEmail", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        contingencia_service_1.ContingenciaService,
        email_service_1.EmailService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map