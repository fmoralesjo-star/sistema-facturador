"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotasCreditoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const configuracion_entity_1 = require("../admin/entities/configuracion.entity");
const notas_credito_service_1 = require("./notas-credito.service");
const notas_credito_controller_1 = require("./notas-credito.controller");
const nota_credito_entity_1 = require("./entities/nota-credito.entity");
const facturas_module_1 = require("../facturas/facturas.module");
const inventario_module_1 = require("../inventario/inventario.module");
const contabilidad_module_1 = require("../contabilidad/contabilidad.module");
const sri_module_1 = require("../sri/sri.module");
let NotasCreditoModule = class NotasCreditoModule {
};
exports.NotasCreditoModule = NotasCreditoModule;
exports.NotasCreditoModule = NotasCreditoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([nota_credito_entity_1.NotaCredito, nota_credito_entity_1.NotaCreditoDetalle, configuracion_entity_1.Configuracion]),
            facturas_module_1.FacturasModule,
            inventario_module_1.InventarioModule,
            contabilidad_module_1.ContabilidadModule,
            sri_module_1.SriModule,
        ],
        controllers: [notas_credito_controller_1.NotasCreditoController],
        providers: [notas_credito_service_1.NotasCreditoService],
        exports: [notas_credito_service_1.NotasCreditoService],
    })
], NotasCreditoModule);
//# sourceMappingURL=notas-credito.module.js.map