
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PlanCuentasService } from './src/modules/contabilidad/services/plan-cuentas.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(PlanCuentasService);

    console.log('--- CLEARED PARTIAL PLAN ---');
    await service.removeAll();
    console.log('All accounts deleted.');

    await app.close();
}
bootstrap();
