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
exports.LiquidacionesController = void 0;
const common_1 = require("@nestjs/common");
const liquidaciones_service_1 = require("./services/liquidaciones.service");
const create_liquidacion_dto_1 = require("./dto/create-liquidacion.dto");
let LiquidacionesController = class LiquidacionesController {
    constructor(liquidacionesService) {
        this.liquidacionesService = liquidacionesService;
    }
    create(createDto) {
        return this.liquidacionesService.create(createDto);
    }
    findAll(desde, hasta, estado) {
        const filtros = {
            desde: desde ? new Date(desde) : undefined,
            hasta: hasta ? new Date(hasta) : undefined,
            estado,
        };
        return this.liquidacionesService.findAll(filtros);
    }
    findOne(id) {
        return this.liquidacionesService.findOne(id);
    }
    anular(id) {
        return this.liquidacionesService.anular(id);
    }
};
exports.LiquidacionesController = LiquidacionesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_liquidacion_dto_1.CreateLiquidacionDto]),
    __metadata("design:returntype", void 0)
], LiquidacionesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('desde')),
    __param(1, (0, common_1.Query)('hasta')),
    __param(2, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], LiquidacionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LiquidacionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/anular'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LiquidacionesController.prototype, "anular", null);
exports.LiquidacionesController = LiquidacionesController = __decorate([
    (0, common_1.Controller)('liquidaciones-compra'),
    __metadata("design:paramtypes", [liquidaciones_service_1.LiquidacionesService])
], LiquidacionesController);
//# sourceMappingURL=liquidaciones.controller.js.map