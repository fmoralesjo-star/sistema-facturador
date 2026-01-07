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
exports.CajaChicaController = void 0;
const common_1 = require("@nestjs/common");
const caja_chica_service_1 = require("./caja-chica.service");
const create_caja_chica_movimiento_dto_1 = require("./dto/create-caja-chica-movimiento.dto");
let CajaChicaController = class CajaChicaController {
    constructor(cajaChicaService) {
        this.cajaChicaService = cajaChicaService;
    }
    registrarMovimiento(createDto) {
        return this.cajaChicaService.registrarMovimiento(createDto);
    }
    obtenerSaldoActual(puntoVentaId) {
        return this.cajaChicaService.obtenerSaldoActual(puntoVentaId);
    }
    obtenerHistorial(puntoVentaId, fechaInicio, fechaFin) {
        return this.cajaChicaService.obtenerHistorial(puntoVentaId, fechaInicio, fechaFin);
    }
};
exports.CajaChicaController = CajaChicaController;
__decorate([
    (0, common_1.Post)('movimiento'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_caja_chica_movimiento_dto_1.CreateCajaChicaMovimientoDto]),
    __metadata("design:returntype", void 0)
], CajaChicaController.prototype, "registrarMovimiento", null);
__decorate([
    (0, common_1.Get)('saldo/:puntoVentaId'),
    __param(0, (0, common_1.Param)('puntoVentaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CajaChicaController.prototype, "obtenerSaldoActual", null);
__decorate([
    (0, common_1.Get)('historial/:puntoVentaId'),
    __param(0, (0, common_1.Param)('puntoVentaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('fechaInicio')),
    __param(2, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], CajaChicaController.prototype, "obtenerHistorial", null);
exports.CajaChicaController = CajaChicaController = __decorate([
    (0, common_1.Controller)('caja-chica'),
    __metadata("design:paramtypes", [caja_chica_service_1.CajaChicaService])
], CajaChicaController);
//# sourceMappingURL=caja-chica.controller.js.map