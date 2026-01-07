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
exports.PlanCuentasController = void 0;
const common_1 = require("@nestjs/common");
const plan_cuentas_service_1 = require("../services/plan-cuentas.service");
let PlanCuentasController = class PlanCuentasController {
    constructor(planCuentasService) {
        this.planCuentasService = planCuentasService;
    }
    create(createDto) {
        return this.planCuentasService.create(createDto);
    }
    findAll() {
        return this.planCuentasService.findAll();
    }
    findCuentasMovimiento() {
        return this.planCuentasService.findCuentasMovimiento();
    }
    async inicializar() {
        await this.planCuentasService.inicializarPlanBasico();
        return { message: 'Plan de cuentas inicializado correctamente' };
    }
    findOne(id) {
        return this.planCuentasService.findOne(+id);
    }
    findByCodigo(codigo) {
        return this.planCuentasService.findByCodigo(codigo);
    }
    update(id, updateDto) {
        return this.planCuentasService.update(+id, updateDto);
    }
    remove(id) {
        return this.planCuentasService.remove(+id);
    }
};
exports.PlanCuentasController = PlanCuentasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlanCuentasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlanCuentasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('movimiento'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlanCuentasController.prototype, "findCuentasMovimiento", null);
__decorate([
    (0, common_1.Get)('inicializar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlanCuentasController.prototype, "inicializar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlanCuentasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('codigo/:codigo'),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlanCuentasController.prototype, "findByCodigo", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlanCuentasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlanCuentasController.prototype, "remove", null);
exports.PlanCuentasController = PlanCuentasController = __decorate([
    (0, common_1.Controller)('plan-cuentas'),
    __metadata("design:paramtypes", [plan_cuentas_service_1.PlanCuentasService])
], PlanCuentasController);
//# sourceMappingURL=plan-cuentas.controller.js.map