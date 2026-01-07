import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { Factura } from './entities/factura.entity';
import { FacturaDetalle } from './entities/factura-detalle.entity';
import { Voucher } from './entities/voucher.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';
import { AsientoContable } from '../contabilidad/entities/asiento-contable.entity';
import { SriModule } from '../sri/sri.module';
import { InventarioModule } from '../inventario/inventario.module';
import { ContabilidadModule } from '../contabilidad/contabilidad.module';
import { EmpresaModule } from '../empresa/empresa.module';
import { PromocionesModule } from '../promociones/promociones.module';
import { RecursosHumanosModule } from '../recursos-humanos/recursos-humanos.module';
import { ConciliacionesModule } from '../conciliaciones/conciliaciones.module';
import { AppModule } from '../../app.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura, FacturaDetalle, Voucher, Producto]),
    SriModule,
    InventarioModule,
    ContabilidadModule,
    EmpresaModule,
    PromocionesModule,
    RecursosHumanosModule,
    ConciliacionesModule,
    forwardRef(() => AppModule),
  ],
  controllers: [FacturasController],
  providers: [FacturasService],
  exports: [FacturasService],
})
export class FacturasModule {}

