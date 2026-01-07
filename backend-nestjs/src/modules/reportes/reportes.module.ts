import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Factura } from '../facturas/entities/factura.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';
import { Empleado } from '../recursos-humanos/entities/empleado.entity';
import { Promocion } from '../promociones/entities/promocion.entity';
import { CuentaContable } from '../contabilidad/entities/cuenta-contable.entity';
import { PartidaContable } from '../contabilidad/entities/partida-contable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Factura,
      Compra,
      Producto,
      MovimientoInventario,
      Empleado,
      MovimientoInventario,
      Empleado,
      Promocion,
      CuentaContable,
      PartidaContable,
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule { }












