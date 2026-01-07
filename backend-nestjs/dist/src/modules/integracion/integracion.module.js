"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegracionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const integracion_controller_1 = require("./integracion.controller");
const integracion_service_1 = require("./integracion.service");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const movimiento_inventario_entity_1 = require("../inventario/entities/movimiento-inventario.entity");
const asiento_contable_entity_1 = require("../contabilidad/entities/asiento-contable.entity");
const promocion_entity_1 = require("../promociones/entities/promocion.entity");
const transferencia_entity_1 = require("../transferencias/entities/transferencia.entity");
const empleado_entity_1 = require("../recursos-humanos/entities/empleado.entity");
let IntegracionModule = class IntegracionModule {
};
exports.IntegracionModule = IntegracionModule;
exports.IntegracionModule = IntegracionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                factura_entity_1.Factura,
                producto_entity_1.Producto,
                movimiento_inventario_entity_1.MovimientoInventario,
                asiento_contable_entity_1.AsientoContable,
                promocion_entity_1.Promocion,
                transferencia_entity_1.Transferencia,
                empleado_entity_1.Empleado,
            ]),
        ],
        controllers: [integracion_controller_1.IntegracionController],
        providers: [integracion_service_1.IntegracionService],
        exports: [integracion_service_1.IntegracionService],
    })
], IntegracionModule);
//# sourceMappingURL=integracion.module.js.map