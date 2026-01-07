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
exports.FlujosOperativosController = void 0;
const common_1 = require("@nestjs/common");
const flujos_operativos_service_1 = require("./flujos-operativos.service");
let FlujosOperativosController = class FlujosOperativosController {
    constructor(flujosService) {
        this.flujosService = flujosService;
    }
    crearOrdenCompra(data) {
        return this.flujosService.crearOrdenCompra(data);
    }
    obtenerOrdenesCompra() {
        return this.flujosService.obtenerOrdenesCompra();
    }
    crearAlbaran(data) {
        return this.flujosService.crearAlbaran(data);
    }
    obtenerAlbaranes() {
        return this.flujosService.obtenerAlbaranes();
    }
    crearTransferencia(data) {
        return this.flujosService.crearTransferencia(data);
    }
    obtenerTransferencias() {
        return this.flujosService.obtenerTransferencias();
    }
    registrarAjuste(data) {
        return this.flujosService.registrarAjuste(data);
    }
    obtenerAjustes() {
        return this.flujosService.obtenerAjustes();
    }
    crearPicking(data) {
        return this.flujosService.crearPicking(data);
    }
    obtenerPickings() {
        return this.flujosService.obtenerPickings();
    }
    crearConteoCiclico(data) {
        return this.flujosService.crearConteoCiclico(data);
    }
    obtenerConteosCiclicos() {
        return this.flujosService.obtenerConteosCiclicos();
    }
};
exports.FlujosOperativosController = FlujosOperativosController;
__decorate([
    (0, common_1.Post)('ordenes-compra'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "crearOrdenCompra", null);
__decorate([
    (0, common_1.Get)('ordenes-compra'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "obtenerOrdenesCompra", null);
__decorate([
    (0, common_1.Post)('albaranes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "crearAlbaran", null);
__decorate([
    (0, common_1.Get)('albaranes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "obtenerAlbaranes", null);
__decorate([
    (0, common_1.Post)('transferencias'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "crearTransferencia", null);
__decorate([
    (0, common_1.Get)('transferencias'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "obtenerTransferencias", null);
__decorate([
    (0, common_1.Post)('ajustes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "registrarAjuste", null);
__decorate([
    (0, common_1.Get)('ajustes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "obtenerAjustes", null);
__decorate([
    (0, common_1.Post)('pickings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "crearPicking", null);
__decorate([
    (0, common_1.Get)('pickings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "obtenerPickings", null);
__decorate([
    (0, common_1.Post)('conteos-ciclicos'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "crearConteoCiclico", null);
__decorate([
    (0, common_1.Get)('conteos-ciclicos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlujosOperativosController.prototype, "obtenerConteosCiclicos", null);
exports.FlujosOperativosController = FlujosOperativosController = __decorate([
    (0, common_1.Controller)('inventario/flujos'),
    __metadata("design:paramtypes", [flujos_operativos_service_1.FlujosOperativosService])
], FlujosOperativosController);
//# sourceMappingURL=flujos-operativos.controller.js.map