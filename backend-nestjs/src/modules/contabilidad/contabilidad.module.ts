import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContabilidadController } from './contabilidad.controller';
import { ContabilidadService } from './contabilidad.service';
import { AsientoContable } from './entities/asiento-contable.entity';
import { CuentaContable } from './entities/cuenta-contable.entity';
import { PartidaContable } from './entities/partida-contable.entity';
import { PlanCuentasService } from './services/plan-cuentas.service';
import { PlanCuentasController } from './controllers/plan-cuentas.controller';
import { DatosEjemploService } from './services/datos-ejemplo.service';
import { DatosEjemploController } from './controllers/datos-ejemplo.controller';
import { ReportesService } from './services/reportes.service';
import { ReportesController } from './controllers/reportes.controller';
import { KpisController } from './kpis.controller';
import { KpisService } from './kpis.service';

import { AdministracionTIModule } from '../administracion-ti/administracion-ti.module';
import { PlantillaAsiento } from './entities/plantilla-asiento.entity';
import { PlantillaDetalle } from './entities/plantilla-detalle.entity';
import { PlantillasService } from './services/plantillas.service';
import { Empresa } from '../empresa/entities/empresa.entity';
import { Factura } from '../facturas/entities/factura.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Producto } from '../productos/entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AsientoContable,
      CuentaContable,
      PartidaContable,
      PlantillaAsiento,
      PlantillaDetalle,
      Factura,
      Compra,
      Producto,
      // Empresa,
    ]),
    AdministracionTIModule,
  ],
  controllers: [
    ContabilidadController,
    PlanCuentasController,
    DatosEjemploController,
    ReportesController,
    KpisController,
  ],
  providers: [
    ContabilidadService,
    PlanCuentasService,
    DatosEjemploService,
    ReportesService,
    PlantillasService,
    KpisService,
  ],
  exports: [ContabilidadService, PlanCuentasService, ReportesService, PlantillasService],
})
export class ContabilidadModule { }

