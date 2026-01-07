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
exports.KpisController = void 0;
const common_1 = require("@nestjs/common");
const kpis_service_1 = require("./kpis.service");
let KpisController = class KpisController {
    constructor(kpisService) {
        this.kpisService = kpisService;
    }
    async getPuntoEquilibrio(periodo = 'mes') {
        return this.kpisService.calcularPuntoEquilibrio(periodo);
    }
    async getMargenesUtilidad(fechaInicio, fechaFin) {
        return this.kpisService.calcularMargenesUtilidad(fechaInicio, fechaFin);
    }
    async getTopProductos(limite = 5, periodo = 'mes') {
        return this.kpisService.obtenerTopProductos(limite, periodo);
    }
    async getROI(fechaInicio, fechaFin) {
        return this.kpisService.calcularROI(fechaInicio, fechaFin);
    }
    async getRotacionInventario(periodo = 'mes') {
        return this.kpisService.calcularRotacionInventario(periodo);
    }
    async getDiasCuentasCobrar() {
        return this.kpisService.calcularDiasCuentasCobrar();
    }
    async getRatioCorriente() {
        return this.kpisService.calcularRatioCorriente();
    }
    async getResumenCompleto(periodo = 'mes') {
        return this.kpisService.obtenerResumenCompleto(periodo);
    }
};
exports.KpisController = KpisController;
__decorate([
    (0, common_1.Get)('punto-equilibrio'),
    __param(0, (0, common_1.Query)('periodo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getPuntoEquilibrio", null);
__decorate([
    (0, common_1.Get)('margenes-utilidad'),
    __param(0, (0, common_1.Query)('fecha_inicio')),
    __param(1, (0, common_1.Query)('fecha_fin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getMargenesUtilidad", null);
__decorate([
    (0, common_1.Get)('top-productos'),
    __param(0, (0, common_1.Query)('limite')),
    __param(1, (0, common_1.Query)('periodo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getTopProductos", null);
__decorate([
    (0, common_1.Get)('roi'),
    __param(0, (0, common_1.Query)('fecha_inicio')),
    __param(1, (0, common_1.Query)('fecha_fin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getROI", null);
__decorate([
    (0, common_1.Get)('rotacion-inventario'),
    __param(0, (0, common_1.Query)('periodo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getRotacionInventario", null);
__decorate([
    (0, common_1.Get)('dias-cuentas-cobrar'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getDiasCuentasCobrar", null);
__decorate([
    (0, common_1.Get)('ratio-corriente'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getRatioCorriente", null);
__decorate([
    (0, common_1.Get)('resumen-completo'),
    __param(0, (0, common_1.Query)('periodo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getResumenCompleto", null);
exports.KpisController = KpisController = __decorate([
    (0, common_1.Controller)('contabilidad/kpis'),
    __metadata("design:paramtypes", [kpis_service_1.KpisService])
], KpisController);
//# sourceMappingURL=kpis.controller.js.map