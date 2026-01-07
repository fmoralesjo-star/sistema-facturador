import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Proveedor } from './entities/proveedor.entity';
import { ComprobanteRetencion } from './entities/comprobante-retencion.entity';
import { Producto } from '../productos/entities/producto.entity';
import { InventarioModule } from '../inventario/inventario.module';
import { ContabilidadModule } from '../contabilidad/contabilidad.module';
import { SriModule } from '../sri/sri.module';
import { RetencionesService } from './services/retenciones.service';
import { RetencionesController } from './retenciones.controller';
import { LiquidacionesService } from './services/liquidaciones.service';
import { LiquidacionesController } from './liquidaciones.controller';
import { LiquidacionCompra } from './entities/liquidacion-compra.entity';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
    imports: [
        TypeOrmModule.forFeature([Compra, CompraDetalle, Proveedor, Producto, ComprobanteRetencion, LiquidacionCompra]),
        InventarioModule,
        ContabilidadModule,
        SriModule,
    ],
    controllers: [ComprasController, RetencionesController, LiquidacionesController],
    providers: [ComprasService, RetencionesService, LiquidacionesService, EventsGateway],
    exports: [ComprasService, RetencionesService, LiquidacionesService],
})
export class ComprasModule { }
