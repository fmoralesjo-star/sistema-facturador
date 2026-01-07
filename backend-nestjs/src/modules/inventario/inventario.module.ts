import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Ubicacion } from './entities/ubicacion.entity';
import { ProductoUbicacion } from './entities/producto-ubicacion.entity';
import { ProductoPuntoVenta } from './entities/producto-punto-venta.entity';
import { UbicacionesService } from './ubicaciones.service';
import { UbicacionesController } from './ubicaciones.controller';
import { OrdenCompra } from './entities/orden-compra.entity';
import { OrdenCompraDetalle } from './entities/orden-compra-detalle.entity';
import { Albaran } from './entities/albaran.entity';
import { AlbaranDetalle } from './entities/albaran-detalle.entity';
import { Transferencia } from './entities/transferencia.entity';
import { TransferenciaDetalle } from './entities/transferencia-detalle.entity';
import { AjusteInventario } from './entities/ajuste-inventario.entity';
import { Picking } from './entities/picking.entity';
import { PickingDetalle } from './entities/picking-detalle.entity';
import { ConteoCiclico } from './entities/conteo-ciclico.entity';
import { ConteoCiclicoDetalle } from './entities/conteo-ciclico-detalle.entity';
import { LoteInventario } from './entities/lote-inventario.entity';
import { FlujosOperativosService } from './flujos-operativos.service';
import { FlujosOperativosController } from './flujos-operativos.controller';
import { ValoracionInventarioService } from './valoracion-inventario.service';
import { AlertasInventarioService } from './alertas-inventario.service';
import { ContabilidadModule } from '../contabilidad/contabilidad.module';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoInventario,
      Producto,
      Ubicacion,
      ProductoUbicacion,
      ProductoPuntoVenta,
      OrdenCompra,
      OrdenCompraDetalle,
      Albaran,
      AlbaranDetalle,
      Transferencia,
      TransferenciaDetalle,
      AjusteInventario,
      Picking,
      PickingDetalle,
      ConteoCiclico,
      ConteoCiclicoDetalle,
      LoteInventario,
    ]),
    forwardRef(() => ContabilidadModule),
  ],
  controllers: [InventarioController, UbicacionesController, FlujosOperativosController],
  providers: [InventarioService, UbicacionesService, FlujosOperativosService, ValoracionInventarioService, AlertasInventarioService, EventsGateway],
  exports: [InventarioService, UbicacionesService, FlujosOperativosService, ValoracionInventarioService, AlertasInventarioService],
})
export class InventarioModule { }

