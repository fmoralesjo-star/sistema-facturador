"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContabilidadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contabilidad_controller_1 = require("./contabilidad.controller");
const contabilidad_service_1 = require("./contabilidad.service");
const asiento_contable_entity_1 = require("./entities/asiento-contable.entity");
const cuenta_contable_entity_1 = require("./entities/cuenta-contable.entity");
const partida_contable_entity_1 = require("./entities/partida-contable.entity");
const plan_cuentas_service_1 = require("./services/plan-cuentas.service");
const plan_cuentas_controller_1 = require("./controllers/plan-cuentas.controller");
const datos_ejemplo_service_1 = require("./services/datos-ejemplo.service");
const datos_ejemplo_controller_1 = require("./controllers/datos-ejemplo.controller");
const reportes_service_1 = require("./services/reportes.service");
const reportes_controller_1 = require("./controllers/reportes.controller");
const kpis_controller_1 = require("./kpis.controller");
const kpis_service_1 = require("./kpis.service");
const administracion_ti_module_1 = require("../administracion-ti/administracion-ti.module");
const plantilla_asiento_entity_1 = require("./entities/plantilla-asiento.entity");
const plantilla_detalle_entity_1 = require("./entities/plantilla-detalle.entity");
const plantillas_service_1 = require("./services/plantillas.service");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const compra_entity_1 = require("../compras/entities/compra.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
let ContabilidadModule = class ContabilidadModule {
};
exports.ContabilidadModule = ContabilidadModule;
exports.ContabilidadModule = ContabilidadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                asiento_contable_entity_1.AsientoContable,
                cuenta_contable_entity_1.CuentaContable,
                partida_contable_entity_1.PartidaContable,
                plantilla_asiento_entity_1.PlantillaAsiento,
                plantilla_detalle_entity_1.PlantillaDetalle,
                factura_entity_1.Factura,
                compra_entity_1.Compra,
                producto_entity_1.Producto,
            ]),
            administracion_ti_module_1.AdministracionTIModule,
        ],
        controllers: [
            contabilidad_controller_1.ContabilidadController,
            plan_cuentas_controller_1.PlanCuentasController,
            datos_ejemplo_controller_1.DatosEjemploController,
            reportes_controller_1.ReportesController,
            kpis_controller_1.KpisController,
        ],
        providers: [
            contabilidad_service_1.ContabilidadService,
            plan_cuentas_service_1.PlanCuentasService,
            datos_ejemplo_service_1.DatosEjemploService,
            reportes_service_1.ReportesService,
            plantillas_service_1.PlantillasService,
            kpis_service_1.KpisService,
        ],
        exports: [contabilidad_service_1.ContabilidadService, plan_cuentas_service_1.PlanCuentasService, reportes_service_1.ReportesService, plantillas_service_1.PlantillasService],
    })
], ContabilidadModule);
//# sourceMappingURL=contabilidad.module.js.map