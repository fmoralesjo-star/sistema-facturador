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
exports.PuntosVentaController = void 0;
const common_1 = require("@nestjs/common");
const puntos_venta_service_1 = require("./puntos-venta.service");
const create_punto_venta_dto_1 = require("./dto/create-punto-venta.dto");
const update_punto_venta_dto_1 = require("./dto/update-punto-venta.dto");
let PuntosVentaController = class PuntosVentaController {
    constructor(puntosVentaService) {
        this.puntosVentaService = puntosVentaService;
    }
    create(createPuntoVentaDto) {
        return this.puntosVentaService.create(createPuntoVentaDto);
    }
    findAll() {
        return this.puntosVentaService.findAll();
    }
    findOne(id) {
        return this.puntosVentaService.findOne(id);
    }
    update(id, updatePuntoVentaDto) {
        return this.puntosVentaService.update(id, updatePuntoVentaDto);
    }
    remove(id) {
        return this.puntosVentaService.remove(id);
    }
};
exports.PuntosVentaController = PuntosVentaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_punto_venta_dto_1.CreatePuntoVentaDto]),
    __metadata("design:returntype", void 0)
], PuntosVentaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PuntosVentaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PuntosVentaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_punto_venta_dto_1.UpdatePuntoVentaDto]),
    __metadata("design:returntype", void 0)
], PuntosVentaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PuntosVentaController.prototype, "remove", null);
exports.PuntosVentaController = PuntosVentaController = __decorate([
    (0, common_1.Controller)('puntos-venta'),
    __metadata("design:paramtypes", [puntos_venta_service_1.PuntosVentaService])
], PuntosVentaController);
//# sourceMappingURL=puntos-venta.controller.js.map