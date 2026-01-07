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
exports.TransferenciasController = void 0;
const common_1 = require("@nestjs/common");
const transferencias_service_1 = require("./transferencias.service");
const create_transferencia_dto_1 = require("./dto/create-transferencia.dto");
let TransferenciasController = class TransferenciasController {
    constructor(transferenciasService) {
        this.transferenciasService = transferenciasService;
    }
    create(createTransferenciaDto) {
        return this.transferenciasService.create(createTransferenciaDto);
    }
    findAll() {
        return this.transferenciasService.findAll();
    }
    findOne(id) {
        return this.transferenciasService.findOne(id);
    }
};
exports.TransferenciasController = TransferenciasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transferencia_dto_1.CreateTransferenciaDto]),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "findOne", null);
exports.TransferenciasController = TransferenciasController = __decorate([
    (0, common_1.Controller)('transferencias'),
    __metadata("design:paramtypes", [transferencias_service_1.TransferenciasService])
], TransferenciasController);
//# sourceMappingURL=transferencias.controller.js.map