"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const plan_cuentas_service_1 = require("./src/modules/contabilidad/services/plan-cuentas.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const service = app.get(plan_cuentas_service_1.PlanCuentasService);
    console.log('--- CHECKING ACCOUNTS ---');
    try {
        const accounts = await service.findAll();
        console.log(`Total accounts: ${accounts.length}`);
        accounts.forEach(a => console.log(`${a.codigo} - ${a.nombre} (ID: ${a.id})`));
    }
    catch (e) {
        console.error(e);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=check-accounts.js.map