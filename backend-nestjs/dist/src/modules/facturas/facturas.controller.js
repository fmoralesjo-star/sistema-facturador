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
exports.FacturasController = void 0;
const common_1 = require("@nestjs/common");
const facturas_service_1 = require("./facturas.service");
const create_factura_dto_1 = require("./dto/create-factura.dto");
let FacturasController = class FacturasController {
    constructor(facturasService) {
        this.facturasService = facturasService;
    }
    create(createFacturaDto) {
        return this.facturasService.create(createFacturaDto);
    }
    findAll() {
        return this.facturasService.findAll();
    }
    obtenerEstadisticas() {
        return this.facturasService.obtenerEstadisticas();
    }
    buscarFacturas(filtros) {
        return this.facturasService.buscarFacturas({
            fechaInicio: filtros.fechaInicio,
            fechaFin: filtros.fechaFin,
            clienteId: filtros.clienteId ? parseInt(filtros.clienteId) : undefined,
            estadoSri: filtros.estadoSri,
        });
    }
    findOne(id) {
        return this.facturasService.findOne(id);
    }
    updateEstado(id, estado) {
        return this.facturasService.updateEstado(id, estado);
    }
    anular(id) {
        return this.facturasService.anular(id);
    }
};
exports.FacturasController = FacturasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_factura_dto_1.CreateFacturaDto]),
    __metadata("design:returntype", void 0)
], FacturasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FacturasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FacturasController.prototype, "obtenerEstadisticas", null);
__decorate([
    (0, common_1.Get)('buscar'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FacturasController.prototype, "buscarFacturas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FacturasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/estado'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], FacturasController.prototype, "updateEstado", null);
__decorate([
    (0, common_1.Post)(':id/anular'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FacturasController.prototype, "anular", null);
exports.FacturasController = FacturasController = __decorate([
    (0, common_1.Controller)('facturas'),
    __metadata("design:paramtypes", [facturas_service_1.FacturasService])
], FacturasController);
//# sourceMappingURL=facturas.controller.js.map