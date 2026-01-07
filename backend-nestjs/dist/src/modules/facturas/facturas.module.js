"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacturasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const facturas_controller_1 = require("./facturas.controller");
const facturas_service_1 = require("./facturas.service");
const factura_entity_1 = require("./entities/factura.entity");
const factura_detalle_entity_1 = require("./entities/factura-detalle.entity");
const voucher_entity_1 = require("./entities/voucher.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const sri_module_1 = require("../sri/sri.module");
const inventario_module_1 = require("../inventario/inventario.module");
const contabilidad_module_1 = require("../contabilidad/contabilidad.module");
const empresa_module_1 = require("../empresa/empresa.module");
const promociones_module_1 = require("../promociones/promociones.module");
const recursos_humanos_module_1 = require("../recursos-humanos/recursos-humanos.module");
const conciliaciones_module_1 = require("../conciliaciones/conciliaciones.module");
const app_module_1 = require("../../app.module");
let FacturasModule = class FacturasModule {
};
exports.FacturasModule = FacturasModule;
exports.FacturasModule = FacturasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([factura_entity_1.Factura, factura_detalle_entity_1.FacturaDetalle, voucher_entity_1.Voucher, producto_entity_1.Producto]),
            sri_module_1.SriModule,
            inventario_module_1.InventarioModule,
            contabilidad_module_1.ContabilidadModule,
            empresa_module_1.EmpresaModule,
            promociones_module_1.PromocionesModule,
            recursos_humanos_module_1.RecursosHumanosModule,
            conciliaciones_module_1.ConciliacionesModule,
            (0, common_1.forwardRef)(() => app_module_1.AppModule),
        ],
        controllers: [facturas_controller_1.FacturasController],
        providers: [facturas_service_1.FacturasService],
        exports: [facturas_service_1.FacturasService],
    })
], FacturasModule);
//# sourceMappingURL=facturas.module.js.map