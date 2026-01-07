"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const inventario_service_1 = require("./inventario.service");
const inventario_controller_1 = require("./inventario.controller");
const movimiento_inventario_entity_1 = require("./entities/movimiento-inventario.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const ubicacion_entity_1 = require("./entities/ubicacion.entity");
const producto_ubicacion_entity_1 = require("./entities/producto-ubicacion.entity");
const producto_punto_venta_entity_1 = require("./entities/producto-punto-venta.entity");
const ubicaciones_service_1 = require("./ubicaciones.service");
const ubicaciones_controller_1 = require("./ubicaciones.controller");
const orden_compra_entity_1 = require("./entities/orden-compra.entity");
const orden_compra_detalle_entity_1 = require("./entities/orden-compra-detalle.entity");
const albaran_entity_1 = require("./entities/albaran.entity");
const albaran_detalle_entity_1 = require("./entities/albaran-detalle.entity");
const transferencia_entity_1 = require("./entities/transferencia.entity");
const transferencia_detalle_entity_1 = require("./entities/transferencia-detalle.entity");
const ajuste_inventario_entity_1 = require("./entities/ajuste-inventario.entity");
const picking_entity_1 = require("./entities/picking.entity");
const picking_detalle_entity_1 = require("./entities/picking-detalle.entity");
const conteo_ciclico_entity_1 = require("./entities/conteo-ciclico.entity");
const conteo_ciclico_detalle_entity_1 = require("./entities/conteo-ciclico-detalle.entity");
const lote_inventario_entity_1 = require("./entities/lote-inventario.entity");
const flujos_operativos_service_1 = require("./flujos-operativos.service");
const flujos_operativos_controller_1 = require("./flujos-operativos.controller");
const valoracion_inventario_service_1 = require("./valoracion-inventario.service");
const alertas_inventario_service_1 = require("./alertas-inventario.service");
const contabilidad_module_1 = require("../contabilidad/contabilidad.module");
const events_gateway_1 = require("../../gateways/events.gateway");
let InventarioModule = class InventarioModule {
};
exports.InventarioModule = InventarioModule;
exports.InventarioModule = InventarioModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                movimiento_inventario_entity_1.MovimientoInventario,
                producto_entity_1.Producto,
                ubicacion_entity_1.Ubicacion,
                producto_ubicacion_entity_1.ProductoUbicacion,
                producto_punto_venta_entity_1.ProductoPuntoVenta,
                orden_compra_entity_1.OrdenCompra,
                orden_compra_detalle_entity_1.OrdenCompraDetalle,
                albaran_entity_1.Albaran,
                albaran_detalle_entity_1.AlbaranDetalle,
                transferencia_entity_1.Transferencia,
                transferencia_detalle_entity_1.TransferenciaDetalle,
                ajuste_inventario_entity_1.AjusteInventario,
                picking_entity_1.Picking,
                picking_detalle_entity_1.PickingDetalle,
                conteo_ciclico_entity_1.ConteoCiclico,
                conteo_ciclico_detalle_entity_1.ConteoCiclicoDetalle,
                lote_inventario_entity_1.LoteInventario,
            ]),
            (0, common_1.forwardRef)(() => contabilidad_module_1.ContabilidadModule),
        ],
        controllers: [inventario_controller_1.InventarioController, ubicaciones_controller_1.UbicacionesController, flujos_operativos_controller_1.FlujosOperativosController],
        providers: [inventario_service_1.InventarioService, ubicaciones_service_1.UbicacionesService, flujos_operativos_service_1.FlujosOperativosService, valoracion_inventario_service_1.ValoracionInventarioService, alertas_inventario_service_1.AlertasInventarioService, events_gateway_1.EventsGateway],
        exports: [inventario_service_1.InventarioService, ubicaciones_service_1.UbicacionesService, flujos_operativos_service_1.FlujosOperativosService, valoracion_inventario_service_1.ValoracionInventarioService, alertas_inventario_service_1.AlertasInventarioService],
    })
], InventarioModule);
//# sourceMappingURL=inventario.module.js.map