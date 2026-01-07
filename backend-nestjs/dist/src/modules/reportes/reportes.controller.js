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
const reportes_service_1 = require("./reportes.service");
let ReportesController = class ReportesController {
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    reporteVentasPorVendedor(fechaInicio, fechaFin) {
        return this.reportesService.reporteVentasPorVendedor(fechaInicio ? new Date(fechaInicio) : undefined, fechaFin ? new Date(fechaFin) : undefined);
    }
    reporteProductosMasVendidos(fechaInicio, fechaFin, limite) {
        return this.reportesService.reporteProductosMasVendidos(fechaInicio ? new Date(fechaInicio) : undefined, fechaFin ? new Date(fechaFin) : undefined, limite || 10);
    }
    reporteRotacionInventario() {
        return this.reportesService.reporteRotacionInventario();
    }
    reporteEfectividadPromociones(fechaInicio, fechaFin) {
        return this.reportesService.reporteEfectividadPromociones(fechaInicio ? new Date(fechaInicio) : undefined, fechaFin ? new Date(fechaFin) : undefined);
    }
    reporteComprasVsVentas(fechaInicio, fechaFin) {
        return this.reportesService.reporteComprasVsVentas(fechaInicio ? new Date(fechaInicio) : undefined, fechaFin ? new Date(fechaFin) : undefined);
    }
    balanceGeneral(fechaCorte) {
        return this.reportesService.generarBalanceGeneral(fechaCorte ? new Date(fechaCorte) : new Date());
    }
    estadoResultados(fechaInicio, fechaFin) {
        return this.reportesService.generarEstadoResultados(fechaInicio ? new Date(fechaInicio) : new Date(new Date().getFullYear(), 0, 1), fechaFin ? new Date(fechaFin) : new Date());
    }
    libroDiario(fechaInicio, fechaFin) {
        return this.reportesService.generarLibroDiario(fechaInicio ? new Date(fechaInicio) : new Date(), fechaFin ? new Date(fechaFin) : new Date());
    }
    libroMayor(fechaInicio, fechaFin, cuentaId) {
        return this.reportesService.generarLibroMayor(fechaInicio ? new Date(fechaInicio) : new Date(), fechaFin ? new Date(fechaFin) : new Date(), cuentaId ? parseInt(cuentaId) : undefined);
    }
    flujoCaja(fechaInicio, fechaFin) {
        return this.reportesService.generarFlujoCaja(fechaInicio ? new Date(fechaInicio) : new Date(new Date().getFullYear(), 0, 1), fechaFin ? new Date(fechaFin) : new Date());
    }
};
exports.ReportesController = ReportesController;
__decorate([
    (0, common_1.Get)('ventas-por-vendedor'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "reporteVentasPorVendedor", null);
__decorate([
    (0, common_1.Get)('productos-mas-vendidos'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __param(2, (0, common_1.Query)('limite', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "reporteProductosMasVendidos", null);
__decorate([
    (0, common_1.Get)('rotacion-inventario'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "reporteRotacionInventario", null);
__decorate([
    (0, common_1.Get)('efectividad-promociones'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "reporteEfectividadPromociones", null);
__decorate([
    (0, common_1.Get)('compras-vs-ventas'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "reporteComprasVsVentas", null);
__decorate([
    (0, common_1.Get)('balance-general'),
    __param(0, (0, common_1.Query)('fechaCorte')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "balanceGeneral", null);
__decorate([
    (0, common_1.Get)('estado-resultados'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "estadoResultados", null);
__decorate([
    (0, common_1.Get)('libro-diario'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "libroDiario", null);
__decorate([
    (0, common_1.Get)('libro-mayor'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __param(2, (0, common_1.Query)('cuentaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "libroMayor", null);
__decorate([
    (0, common_1.Get)('flujo-caja'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "flujoCaja", null);
exports.ReportesController = ReportesController = __decorate([
    (0, common_1.Controller)('reportes'),
    __metadata("design:paramtypes", [reportes_service_1.ReportesService])
], ReportesController);
//# sourceMappingURL=reportes.controller.js.map