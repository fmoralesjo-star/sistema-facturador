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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatosEjemploController = void 0;
const common_1 = require("@nestjs/common");
const datos_ejemplo_service_1 = require("../services/datos-ejemplo.service");
let DatosEjemploController = class DatosEjemploController {
    constructor(datosEjemploService) {
        this.datosEjemploService = datosEjemploService;
    }
    async generarDatosEjemplo() {
        return this.datosEjemploService.generarDatosEjemplo();
    }
    async limpiarDatosEjemplo() {
        return this.datosEjemploService.limpiarDatosEjemplo();
    }
};
exports.DatosEjemploController = DatosEjemploController;
__decorate([
    (0, common_1.Post)('generar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatosEjemploController.prototype, "generarDatosEjemplo", null);
__decorate([
    (0, common_1.Post)('limpiar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatosEjemploController.prototype, "limpiarDatosEjemplo", null);
exports.DatosEjemploController = DatosEjemploController = __decorate([
    (0, common_1.Controller)('contabilidad/datos-ejemplo'),
    __metadata("design:paramtypes", [datos_ejemplo_service_1.DatosEjemploService])
], DatosEjemploController);
//# sourceMappingURL=datos-ejemplo.controller.js.map