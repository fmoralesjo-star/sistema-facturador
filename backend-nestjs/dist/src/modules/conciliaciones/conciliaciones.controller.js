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
exports.ConciliacionesController = void 0;
const common_1 = require("@nestjs/common");
const conciliaciones_service_1 = require("./conciliaciones.service");
const create_conciliacion_dto_1 = require("./dto/create-conciliacion.dto");
let ConciliacionesController = class ConciliacionesController {
    constructor(conciliacionesService) {
        this.conciliacionesService = conciliacionesService;
    }
    create(createConciliacionDto) {
        return this.conciliacionesService.create(createConciliacionDto);
    }
    findAll(bancoId, facturaId) {
        if (bancoId) {
            return this.conciliacionesService.findByBanco(+bancoId);
        }
        if (facturaId) {
            return this.conciliacionesService.findByFactura(+facturaId);
        }
        return this.conciliacionesService.findAll();
    }
    findAllExtracto(bancoId) {
        return this.conciliacionesService.findAllExtracto(+bancoId);
    }
    findOne(id) {
        return this.conciliacionesService.findOne(+id);
    }
    update(id, updateData) {
        return this.conciliacionesService.update(+id, updateData);
    }
    conciliar(id) {
        return this.conciliacionesService.conciliar(+id);
    }
    remove(id) {
        return this.conciliacionesService.remove(+id);
    }
    sincronizarConFactura(facturaId, pagos) {
        return this.conciliacionesService.sincronizarConFactura(+facturaId, pagos);
    }
    importarExtracto(body) {
        return this.conciliacionesService.importarExtracto(body.banco_id, body.csv);
    }
    procesarExtractoIA(body) {
        return this.conciliacionesService.procesarExtractoIA(body.data, body.banco_id);
    }
    getPendientes(bancoId) {
        return this.conciliacionesService.getPendientesIA(bancoId ? +bancoId : undefined);
    }
    getSugerenciasIA(id) {
        return this.conciliacionesService.getSugerenciasIA(+id);
    }
    confirmarMatchIA(transaccionId, conciliacionId) {
        return this.conciliacionesService.confirmarMatchIA(+transaccionId, conciliacionId);
    }
    getEstadisticasIA(bancoId) {
        return this.conciliacionesService.getEstadisticasIA(bancoId ? +bancoId : undefined);
    }
};
exports.ConciliacionesController = ConciliacionesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conciliacion_dto_1.CreateConciliacionDto]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('banco_id')),
    __param(1, (0, common_1.Query)('factura_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('extracto'),
    __param(0, (0, common_1.Query)('banco_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "findAllExtracto", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/conciliar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "conciliar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('sincronizar-factura/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "sincronizarConFactura", null);
__decorate([
    (0, common_1.Post)('importar-extracto'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "importarExtracto", null);
__decorate([
    (0, common_1.Post)('ia/procesar-extracto'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "procesarExtractoIA", null);
__decorate([
    (0, common_1.Get)('ia/pendientes'),
    __param(0, (0, common_1.Query)('banco_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "getPendientes", null);
__decorate([
    (0, common_1.Get)('ia/transacciones/:id/sugerencias'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "getSugerenciasIA", null);
__decorate([
    (0, common_1.Post)('ia/transacciones/:id/confirmar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('conciliacion_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "confirmarMatchIA", null);
__decorate([
    (0, common_1.Get)('ia/estadisticas'),
    __param(0, (0, common_1.Query)('banco_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConciliacionesController.prototype, "getEstadisticasIA", null);
exports.ConciliacionesController = ConciliacionesController = __decorate([
    (0, common_1.Controller)('conciliaciones'),
    __metadata("design:paramtypes", [conciliaciones_service_1.ConciliacionesService])
], ConciliacionesController);
//# sourceMappingURL=conciliaciones.controller.js.map