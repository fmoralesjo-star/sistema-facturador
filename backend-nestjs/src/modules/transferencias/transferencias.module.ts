import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferenciasController } from './transferencias.controller';
import { TransferenciasService } from './transferencias.service';
import { Transferencia } from './entities/transferencia.entity';
import { Producto } from '../productos/entities/producto.entity';
import { InventarioModule } from '../inventario/inventario.module';
import { ContabilidadModule } from '../contabilidad/contabilidad.module';
import { PuntosVentaModule } from '../puntos-venta/puntos-venta.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transferencia, Producto]),
    InventarioModule,
    ContabilidadModule,
    PuntosVentaModule,
  ],
  controllers: [TransferenciasController],
  providers: [TransferenciasService],
  exports: [TransferenciasService],
})
export class TransferenciasModule { }

