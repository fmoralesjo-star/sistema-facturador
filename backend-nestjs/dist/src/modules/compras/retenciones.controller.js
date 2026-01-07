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
exports.RetencionesController = void 0;
const common_1 = require("@nestjs/common");
const retenciones_service_1 = require("./services/retenciones.service");
let RetencionesController = class RetencionesController {
    constructor(retencionesService) {
        this.retencionesService = retencionesService;
    }
    async findAll(desde, hasta, estado) {
        const filtros = {
            desde: desde ? new Date(desde) : undefined,
            hasta: hasta ? new Date(hasta) : undefined,
            estado: estado,
        };
        return this.retencionesService.findAll(filtros);
    }
    async findOne(id) {
        return this.retencionesService.findOne(id);
    }
    async findByCompra(compraId) {
        return this.retencionesService.findByCompra(compraId);
    }
    async downloadPdf(id, res) {
        const retencion = await this.retencionesService.findOne(id);
        if (!retencion || !retencion.pdf_path) {
            throw new common_1.NotFoundException('Retención o PDF no encontrado');
        }
        const fs = require('fs');
        if (!fs.existsSync(retencion.pdf_path)) {
            throw new common_1.NotFoundException('El archivo PDF no existe en el servidor');
        }
        res.download(retencion.pdf_path);
    }
};
exports.RetencionesController = RetencionesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('desde')),
    __param(1, (0, common_1.Query)('hasta')),
    __param(2, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RetencionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RetencionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('compra/:compraId'),
    __param(0, (0, common_1.Param)('compraId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RetencionesController.prototype, "findByCompra", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RetencionesController.prototype, "downloadPdf", null);
exports.RetencionesController = RetencionesController = __decorate([
    (0, common_1.Controller)('retenciones'),
    __metadata("design:paramtypes", [retenciones_service_1.RetencionesService])
], RetencionesController);
//# sourceMappingURL=retenciones.controller.js.map