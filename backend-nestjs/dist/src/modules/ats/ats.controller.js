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
exports.AtsController = void 0;
const common_1 = require("@nestjs/common");
const ats_service_1 = require("./ats.service");
const generar_ats_dto_1 = require("./dto/generar-ats.dto");
let AtsController = class AtsController {
    constructor(atsService) {
        this.atsService = atsService;
    }
    async generarATS(dto, res) {
        try {
            const xml = await this.atsService.generarATS(dto);
            const filename = `ATS_${dto.mes.toString().padStart(2, '0')}_${dto.anio}.xml`;
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.status(common_1.HttpStatus.OK).send(xml);
        }
        catch (error) {
            console.error('Error generando ATS:', error);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al generar ATS',
                error: error.message
            });
        }
    }
    async obtenerResumen(dto) {
        const anio = parseInt(dto.anio?.toString());
        const mes = parseInt(dto.mes?.toString());
        return this.atsService.obtenerResumenPeriodo({ anio, mes });
    }
};
exports.AtsController = AtsController;
__decorate([
    (0, common_1.Post)('generar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generar_ats_dto_1.GenerarAtsDto, Object]),
    __metadata("design:returntype", Promise)
], AtsController.prototype, "generarATS", null);
__decorate([
    (0, common_1.Get)('resumen'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generar_ats_dto_1.GenerarAtsDto]),
    __metadata("design:returntype", Promise)
], AtsController.prototype, "obtenerResumen", null);
exports.AtsController = AtsController = __decorate([
    (0, common_1.Controller)('ats'),
    __metadata("design:paramtypes", [ats_service_1.AtsService])
], AtsController);
//# sourceMappingURL=ats.controller.js.map