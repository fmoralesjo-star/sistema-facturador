"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reportes_controller_1 = require("./reportes.controller");
const reportes_service_1 = require("./reportes.service");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const compra_entity_1 = require("../compras/entities/compra.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const movimiento_inventario_entity_1 = require("../inventario/entities/movimiento-inventario.entity");
const empleado_entity_1 = require("../recursos-humanos/entities/empleado.entity");
const promocion_entity_1 = require("../promociones/entities/promocion.entity");
const cuenta_contable_entity_1 = require("../contabilidad/entities/cuenta-contable.entity");
const partida_contable_entity_1 = require("../contabilidad/entities/partida-contable.entity");
let ReportesModule = class ReportesModule {
};
exports.ReportesModule = ReportesModule;
exports.ReportesModule = ReportesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                factura_entity_1.Factura,
                compra_entity_1.Compra,
                producto_entity_1.Producto,
                movimiento_inventario_entity_1.MovimientoInventario,
                empleado_entity_1.Empleado,
                movimiento_inventario_entity_1.MovimientoInventario,
                empleado_entity_1.Empleado,
                promocion_entity_1.Promocion,
                cuenta_contable_entity_1.CuentaContable,
                partida_contable_entity_1.PartidaContable,
            ]),
        ],
        controllers: [reportes_controller_1.ReportesController],
        providers: [reportes_service_1.ReportesService],
        exports: [reportes_service_1.ReportesService],
    })
], ReportesModule);
//# sourceMappingURL=reportes.module.js.map