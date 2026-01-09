import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { EventsGateway } from './gateways/events.gateway';
import { FacturasModule } from './modules/facturas/facturas.module';
import { ProductosModule } from './modules/productos/productos.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { ContabilidadModule } from './modules/contabilidad/contabilidad.module';
import { EmpresaModule } from './modules/empresa/empresa.module';
import { SriModule } from './modules/sri/sri.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AdminModule } from './modules/admin/admin.module';
import { PuntosVentaModule } from './modules/puntos-venta/puntos-venta.module';
import { NotasCreditoModule } from './modules/notas-credito/notas-credito.module';
import { CajaChicaModule } from './modules/caja-chica/caja-chica.module';
import { AuditModule } from './modules/audit/audit.module';
import { TesoreriaModule } from './modules/tesoreria/tesoreria.module';
import { RecursosHumanosModule } from './modules/recursos-humanos/recursos-humanos.module';
import { ProformasModule } from './modules/proformas/proformas.module';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';
import { ComprasModule } from './modules/compras/compras.module';
import { AtsModule } from './modules/ats/ats.module';
import { CommonModule } from './modules/common/common.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de datos PostgreSQL
    DatabaseModule,

    // Módulos de negocio
    FacturasModule,
    ProductosModule,
    ClientesModule,
    InventarioModule,
    ContabilidadModule,
    EmpresaModule,
    SriModule,
    UsuariosModule,
    AdminModule,
    PuntosVentaModule,
    NotasCreditoModule,
    CajaChicaModule,
    AuditModule,
    TesoreriaModule,
    RecursosHumanosModule,
    ProformasModule,
    ProveedoresModule,
    ComprasModule,
    AtsModule,
    CommonModule,

    // Scheduler
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
  exports: [EventsGateway],
})
export class AppModule { }

