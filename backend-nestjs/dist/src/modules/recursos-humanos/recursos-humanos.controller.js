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
exports.RecursosHumanosController = void 0;
const common_1 = require("@nestjs/common");
const recursos_humanos_service_1 = require("./recursos-humanos.service");
const create_empleado_dto_1 = require("./dto/create-empleado.dto");
const create_asistencia_dto_1 = require("./dto/create-asistencia.dto");
let RecursosHumanosController = class RecursosHumanosController {
    constructor(rhService) {
        this.rhService = rhService;
    }
    findAllEmpleados() {
        return this.rhService.findAllEmpleados();
    }
    createEmpleado(createDto) {
        return this.rhService.createEmpleado(createDto);
    }
    updateEmpleado(id, updateDto) {
        return this.rhService.updateEmpleado(id, updateDto);
    }
    removeEmpleado(id) {
        return this.rhService.removeEmpleado(id);
    }
    findAllAsistencias() {
        return this.rhService.findAllAsistencias();
    }
    createAsistencia(createDto) {
        return this.rhService.createAsistencia(createDto);
    }
    generarRol(periodo) {
        return this.rhService.generarRolPagos(periodo || new Date().toISOString().slice(0, 7));
    }
};
exports.RecursosHumanosController = RecursosHumanosController;
__decorate([
    (0, common_1.Get)('empleados'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RecursosHumanosController.prototype, "findAllEmpleados", null);
__decorate([
    (0, common_1.Post)('empleados'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_empleado_dto_1.CreateEmpleadoDto]),
    __metadata("design:returntype", void 0)
], RecursosHumanosController.prototype, "createEmpleado", null);
__decorate([
    (0, common_1.Put)('empleados/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_empleado_dto_1.CreateEmpleadoDto]),
    __metadata("design:returntype", void 0)
], RecursosHumanosController.prototype, "updateEmpleado", null);
__decorate([
    (0, common_1.Delete)('empleados/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RecursosHumanosController.prototype, "removeEmpleado", null);
__decorate([
    (0, common_1.Get)('asistencias'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RecursosHumanosController.prototype, "findAllAsistencias", null);
__decorate([
    (0, common_1.Post)('asistencias'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_asistencia_dto_1.CreateAsistenciaDto]),
    __metadata("design:returntype", void 0)
], RecursosHumanosController.prototype, "createAsistencia", null);
__decorate([
    (0, common_1.Post)('generar-rol'),
    __param(0, (0, common_1.Body)('periodo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecursosHumanosController.prototype, "generarRol", null);
exports.RecursosHumanosController = RecursosHumanosController = __decorate([
    (0, common_1.Controller)('recursos-humanos'),
    __metadata("design:paramtypes", [recursos_humanos_service_1.RecursosHumanosService])
], RecursosHumanosController);
//# sourceMappingURL=recursos-humanos.controller.js.map