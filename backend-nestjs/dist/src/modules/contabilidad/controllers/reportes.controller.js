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
exports.ReportesController = void 0;
const common_1 = require("@nestjs/common");
const reportes_service_1 = require("../services/reportes.service");
let ReportesController = class ReportesController {
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    async balanceGeneral(fechaCorte) {
        const fecha = fechaCorte ? new Date(fechaCorte) : undefined;
        return this.reportesService.generarBalanceGeneral(fecha);
    }
    async perdidasGanancias(fechaInicio, fechaFin) {
        if (!fechaInicio || !fechaFin) {
            throw new Error('Se requieren fechaInicio y fechaFin (formato: YYYY-MM-DD)');
        }
        return this.reportesService.generarEstadoPerdidasGanancias(new Date(fechaInicio), new Date(fechaFin));
    }
    async libroMayor(cuentaId, fechaInicio, fechaFin) {
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;
        return this.reportesService.generarLibroMayor(cuentaId, fechaInicioDate, fechaFinDate);
    }
    async cuentasLibroMayor() {
        return this.reportesService.obtenerCuentasParaLibroMayor();
    }
};
exports.ReportesController = ReportesController;
__decorate([
    (0, common_1.Get)('balance-general'),
    __param(0, (0, common_1.Query)('fechaCorte')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "balanceGeneral", null);
__decorate([
    (0, common_1.Get)('perdidas-ganancias'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "perdidasGanancias", null);
__decorate([
    (0, common_1.Get)('libro-mayor/:cuentaId'),
    __param(0, (0, common_1.Param)('cuentaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('fechaInicio')),
    __param(2, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "libroMayor", null);
__decorate([
    (0, common_1.Get)('cuentas-libro-mayor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "cuentasLibroMayor", null);
exports.ReportesController = ReportesController = __decorate([
    (0, common_1.Controller)('contabilidad/reportes'),
    __metadata("design:paramtypes", [reportes_service_1.ReportesService])
], ReportesController);
//# sourceMappingURL=reportes.controller.js.map