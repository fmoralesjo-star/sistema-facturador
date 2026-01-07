"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConciliacionesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const conciliaciones_service_1 = require("./conciliaciones.service");
const conciliaciones_controller_1 = require("./conciliaciones.controller");
const conciliacion_bancaria_entity_1 = require("./entities/conciliacion-bancaria.entity");
const movimiento_bancario_extracto_entity_1 = require("./entities/movimiento-bancario-extracto.entity");
const transaccion_bancaria_entity_1 = require("./entities/transaccion-bancaria.entity");
const conciliacion_ia_service_1 = require("./conciliacion-ia.service");
const bancos_module_1 = require("../bancos/bancos.module");
const contabilidad_module_1 = require("../contabilidad/contabilidad.module");
let ConciliacionesModule = class ConciliacionesModule {
};
exports.ConciliacionesModule = ConciliacionesModule;
exports.ConciliacionesModule = ConciliacionesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([conciliacion_bancaria_entity_1.ConciliacionBancaria, movimiento_bancario_extracto_entity_1.MovimientoBancarioExtracto, transaccion_bancaria_entity_1.TransaccionBancaria]),
            bancos_module_1.BancosModule,
            contabilidad_module_1.ContabilidadModule,
        ],
        controllers: [conciliaciones_controller_1.ConciliacionesController],
        providers: [conciliaciones_service_1.ConciliacionesService, conciliacion_ia_service_1.ConciliacionIAService],
        exports: [conciliaciones_service_1.ConciliacionesService],
    })
], ConciliacionesModule);
//# sourceMappingURL=conciliaciones.module.js.map