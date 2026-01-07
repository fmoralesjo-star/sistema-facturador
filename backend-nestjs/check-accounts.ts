
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PlanCuentasService } from './src/modules/contabilidad/services/plan-cuentas.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(PlanCuentasService);

    console.log('--- CHECKING ACCOUNTS ---');
    try {
        const accounts = await service.findAll();
        console.log(`Total accounts: ${accounts.length}`);
        accounts.forEach(a => console.log(`${a.codigo} - ${a.nombre} (ID: ${a.id})`));
    } catch (e) {
        console.error(e);
    }

    await app.close();
}
bootstrap();
