"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const compras_service_1 = require("./compras.service");
const compras_controller_1 = require("./compras.controller");
const compra_entity_1 = require("./entities/compra.entity");
const compra_detalle_entity_1 = require("./entities/compra-detalle.entity");
const proveedor_entity_1 = require("./entities/proveedor.entity");
const comprobante_retencion_entity_1 = require("./entities/comprobante-retencion.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const inventario_module_1 = require("../inventario/inventario.module");
const contabilidad_module_1 = require("../contabilidad/contabilidad.module");
const sri_module_1 = require("../sri/sri.module");
const retenciones_service_1 = require("./services/retenciones.service");
const retenciones_controller_1 = require("./retenciones.controller");
const liquidaciones_service_1 = require("./services/liquidaciones.service");
const liquidaciones_controller_1 = require("./liquidaciones.controller");
const liquidacion_compra_entity_1 = require("./entities/liquidacion-compra.entity");
const events_gateway_1 = require("../../gateways/events.gateway");
let ComprasModule = class ComprasModule {
};
exports.ComprasModule = ComprasModule;
exports.ComprasModule = ComprasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([compra_entity_1.Compra, compra_detalle_entity_1.CompraDetalle, proveedor_entity_1.Proveedor, producto_entity_1.Producto, comprobante_retencion_entity_1.ComprobanteRetencion, liquidacion_compra_entity_1.LiquidacionCompra]),
            inventario_module_1.InventarioModule,
            contabilidad_module_1.ContabilidadModule,
            sri_module_1.SriModule,
        ],
        controllers: [compras_controller_1.ComprasController, retenciones_controller_1.RetencionesController, liquidaciones_controller_1.LiquidacionesController],
        providers: [compras_service_1.ComprasService, retenciones_service_1.RetencionesService, liquidaciones_service_1.LiquidacionesService, events_gateway_1.EventsGateway],
        exports: [compras_service_1.ComprasService, retenciones_service_1.RetencionesService, liquidaciones_service_1.LiquidacionesService],
    })
], ComprasModule);
//# sourceMappingURL=compras.module.js.map