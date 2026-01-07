import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegracionController } from './integracion.controller';
import { IntegracionService } from './integracion.service';
import { Factura } from '../facturas/entities/factura.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';
import { AsientoContable } from '../contabilidad/entities/asiento-contable.entity';
import { Promocion } from '../promociones/entities/promocion.entity';
import { Transferencia } from '../transferencias/entities/transferencia.entity';
import { Empleado } from '../recursos-humanos/entities/empleado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Factura,
      Producto,
      MovimientoInventario,
      AsientoContable,
      Promocion,
      Transferencia,
      Empleado,
    ]),
  ],
  controllers: [IntegracionController],
  providers: [IntegracionService],
  exports: [IntegracionService],
})
export class IntegracionModule {}












