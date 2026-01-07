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
exports.NotasCreditoController = void 0;
const common_1 = require("@nestjs/common");
const notas_credito_service_1 = require("./notas-credito.service");
const ride_service_1 = require("../sri/services/ride.service");
let NotasCreditoController = class NotasCreditoController {
    constructor(notasCreditoService, rideService) {
        this.notasCreditoService = notasCreditoService;
        this.rideService = rideService;
    }
    create(createDto) {
        return this.notasCreditoService.create(createDto);
    }
    findAll() {
        return this.notasCreditoService.findAll();
    }
    findOne(id) {
        return this.notasCreditoService.findOne(+id);
    }
    async getPdf(id, res) {
        const buffer = await this.rideService.obtenerRIDENotaCredito(+id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename=NC-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.NotasCreditoController = NotasCreditoController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotasCreditoController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotasCreditoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotasCreditoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotasCreditoController.prototype, "getPdf", null);
exports.NotasCreditoController = NotasCreditoController = __decorate([
    (0, common_1.Controller)('notas-credito'),
    __metadata("design:paramtypes", [notas_credito_service_1.NotasCreditoService,
        ride_service_1.RideService])
], NotasCreditoController);
//# sourceMappingURL=notas-credito.controller.js.map