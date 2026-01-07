"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./config/database.module");
const events_gateway_1 = require("./gateways/events.gateway");
const facturas_module_1 = require("./modules/facturas/facturas.module");
const productos_module_1 = require("./modules/productos/productos.module");
const clientes_module_1 = require("./modules/clientes/clientes.module");
const inventario_module_1 = require("./modules/inventario/inventario.module");
const contabilidad_module_1 = require("./modules/contabilidad/contabilidad.module");
const empresa_module_1 = require("./modules/empresa/empresa.module");
const sri_module_1 = require("./modules/sri/sri.module");
const usuarios_module_1 = require("./modules/usuarios/usuarios.module");
const admin_module_1 = require("./modules/admin/admin.module");
const firebase_module_1 = require("./modules/firebase/firebase.module");
const puntos_venta_module_1 = require("./modules/puntos-venta/puntos-venta.module");
const notas_credito_module_1 = require("./modules/notas-credito/notas-credito.module");
const caja_chica_module_1 = require("./modules/caja-chica/caja-chica.module");
const audit_module_1 = require("./modules/audit/audit.module");
const tesoreria_module_1 = require("./modules/tesoreria/tesoreria.module");
const recursos_humanos_module_1 = require("./modules/recursos-humanos/recursos-humanos.module");
const proformas_module_1 = require("./modules/proformas/proformas.module");
const proveedores_module_1 = require("./modules/proveedores/proveedores.module");
const compras_module_1 = require("./modules/compras/compras.module");
const ats_module_1 = require("./modules/ats/ats.module");
const common_module_1 = require("./modules/common/common.module");
const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';
if (useFirestore) {
    console.log('🔥 AppModule: Firestore activado - DatabaseModule deshabilitado');
}
else {
    console.log('🗄️ AppModule: PostgreSQL activado - DatabaseModule habilitado');
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            ...(useFirestore ? [] : [database_module_1.DatabaseModule]),
            ...(useFirestore ? [
                productos_module_1.ProductosModule,
                clientes_module_1.ClientesModule,
                firebase_module_1.FirebaseModule,
            ] : [
                facturas_module_1.FacturasModule,
                productos_module_1.ProductosModule,
                clientes_module_1.ClientesModule,
                inventario_module_1.InventarioModule,
                contabilidad_module_1.ContabilidadModule,
                empresa_module_1.EmpresaModule,
                sri_module_1.SriModule,
                usuarios_module_1.UsuariosModule,
                admin_module_1.AdminModule,
                firebase_module_1.FirebaseModule,
                puntos_venta_module_1.PuntosVentaModule,
                notas_credito_module_1.NotasCreditoModule,
                caja_chica_module_1.CajaChicaModule,
                audit_module_1.AuditModule,
                tesoreria_module_1.TesoreriaModule,
                recursos_humanos_module_1.RecursosHumanosModule,
                proformas_module_1.ProformasModule,
                proveedores_module_1.ProveedoresModule,
                compras_module_1.ComprasModule,
                compras_module_1.ComprasModule,
                ats_module_1.AtsModule,
                common_module_1.CommonModule,
            ]),
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, events_gateway_1.EventsGateway],
        exports: [events_gateway_1.EventsGateway],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map