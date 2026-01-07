"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursosHumanosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const recursos_humanos_controller_1 = require("./recursos-humanos.controller");
const recursos_humanos_service_1 = require("./recursos-humanos.service");
const empleado_entity_1 = require("./entities/empleado.entity");
const asistencia_entity_1 = require("./entities/asistencia.entity");
const contabilidad_module_1 = require("../contabilidad/contabilidad.module");
let RecursosHumanosModule = class RecursosHumanosModule {
};
exports.RecursosHumanosModule = RecursosHumanosModule;
exports.RecursosHumanosModule = RecursosHumanosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([empleado_entity_1.Empleado, asistencia_entity_1.Asistencia]),
            contabilidad_module_1.ContabilidadModule,
        ],
        controllers: [recursos_humanos_controller_1.RecursosHumanosController],
        providers: [recursos_humanos_service_1.RecursosHumanosService],
        exports: [recursos_humanos_service_1.RecursosHumanosService],
    })
], RecursosHumanosModule);
//# sourceMappingURL=recursos-humanos.module.js.map