"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SriModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sri_service_1 = require("./sri.service");
const sri_controller_1 = require("./sri.controller");
const sri_processor_1 = require("./processors/sri.processor");
const firma_electronica_service_1 = require("./services/firma-electronica.service");
const xml_generator_service_1 = require("./services/xml-generator.service");
const xades_bes_service_1 = require("./services/xades-bes.service");
const sri_ws_service_1 = require("./services/sri-ws.service");
const ride_service_1 = require("./services/ride.service");
const xsd_validation_service_1 = require("./services/xsd-validation.service");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const voucher_entity_1 = require("../facturas/entities/voucher.entity");
const impuesto_iva_entity_1 = require("./entities/impuesto-iva.entity");
const retencion_sri_entity_1 = require("./entities/retencion-sri.entity");
const sustento_tributario_entity_1 = require("./entities/sustento-tributario.entity");
const empresa_module_1 = require("../empresa/empresa.module");
const parametros_sri_service_1 = require("./parametros-sri.service");
const parametros_sri_controller_1 = require("./parametros-sri.controller");
const circuit_breaker_service_1 = require("./services/circuit-breaker.service");
const configuracion_entity_1 = require("../admin/entities/configuracion.entity");
const nota_credito_entity_1 = require("../notas-credito/entities/nota-credito.entity");
const sri_retencion_entity_1 = require("./entities/sri-retencion.entity");
const impuestos_service_1 = require("./services/impuestos.service");
const contabilidad_module_1 = require("../contabilidad/contabilidad.module");
let SriModule = class SriModule {
};
exports.SriModule = SriModule;
exports.SriModule = SriModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                factura_entity_1.Factura,
                voucher_entity_1.Voucher,
                impuesto_iva_entity_1.ImpuestoIVA,
                retencion_sri_entity_1.RetencionSRI,
                sustento_tributario_entity_1.SustentoTributario,
                nota_credito_entity_1.NotaCredito,
                sri_retencion_entity_1.SriRetencion,
                configuracion_entity_1.Configuracion
            ]),
            empresa_module_1.EmpresaModule,
            contabilidad_module_1.ContabilidadModule,
        ],
        controllers: [sri_controller_1.SriController, parametros_sri_controller_1.ParametrosSriController],
        providers: [
            sri_service_1.SriService,
            parametros_sri_service_1.ParametrosSriService,
            sri_processor_1.SriProcessor,
            firma_electronica_service_1.FirmaElectronicaService,
            xml_generator_service_1.XmlGeneratorService,
            xades_bes_service_1.XadesBesService,
            sri_ws_service_1.SriWsService,
            ride_service_1.RideService,
            impuestos_service_1.ImpuestosService,
            xsd_validation_service_1.XsdValidationService,
            circuit_breaker_service_1.CircuitBreakerService,
        ],
        exports: [sri_service_1.SriService, firma_electronica_service_1.FirmaElectronicaService, xml_generator_service_1.XmlGeneratorService, ride_service_1.RideService, impuestos_service_1.ImpuestosService, xsd_validation_service_1.XsdValidationService, circuit_breaker_service_1.CircuitBreakerService],
    })
], SriModule);
//# sourceMappingURL=sri.module.js.map