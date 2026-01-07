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
exports.ParametrosSriController = void 0;
const common_1 = require("@nestjs/common");
const parametros_sri_service_1 = require("./parametros-sri.service");
let ParametrosSriController = class ParametrosSriController {
    constructor(service) {
        this.service = service;
    }
    findAllIva() {
        return this.service.findAllIva();
    }
    createIva(data) {
        return this.service.createIva(data);
    }
    toggleIva(id) {
        return this.service.toggleIva(id);
    }
    findAllRetenciones() {
        return this.service.findAllRetenciones();
    }
    createRetencion(data) {
        return this.service.createRetencion(data);
    }
    toggleRetencion(id) {
        return this.service.toggleRetencion(id);
    }
    findAllSustento() {
        return this.service.findAllSustento();
    }
    createSustento(data) {
        return this.service.createSustento(data);
    }
};
exports.ParametrosSriController = ParametrosSriController;
__decorate([
    (0, common_1.Get)('iva'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParametrosSriController.prototype, "findAllIva", null);
__decorate([
    (0, common_1.Post)('iva'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParametrosSriController.prototype, "createIva", null);
__decorate([
    (0, common_1.Patch)('iva/:id/toggle'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ParametrosSriController.prototype, "toggleIva", null);
__decorate([
    (0, common_1.Get)('retenciones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParametrosSriController.prototype, "findAllRetenciones", null);
__decorate([
    (0, common_1.Post)('retenciones'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParametrosSriController.prototype, "createRetencion", null);
__decorate([
    (0, common_1.Patch)('retenciones/:id/toggle'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ParametrosSriController.prototype, "toggleRetencion", null);
__decorate([
    (0, common_1.Get)('sustento'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParametrosSriController.prototype, "findAllSustento", null);
__decorate([
    (0, common_1.Post)('sustento'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParametrosSriController.prototype, "createSustento", null);
exports.ParametrosSriController = ParametrosSriController = __decorate([
    (0, common_1.Controller)('sri/parametros'),
    __metadata("design:paramtypes", [parametros_sri_service_1.ParametrosSriService])
], ParametrosSriController);
//# sourceMappingURL=parametros-sri.controller.js.map