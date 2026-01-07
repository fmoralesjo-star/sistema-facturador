import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from '../admin/entities/configuracion.entity';
import { NotasCreditoService } from './notas-credito.service';
import { NotasCreditoController } from './notas-credito.controller';
import { NotaCredito, NotaCreditoDetalle } from './entities/nota-credito.entity';
import { FacturasModule } from '../facturas/facturas.module';
import { InventarioModule } from '../inventario/inventario.module';
import { ContabilidadModule } from '../contabilidad/contabilidad.module';
import { SriModule } from '../sri/sri.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([NotaCredito, NotaCreditoDetalle, Configuracion]),
        FacturasModule,
        InventarioModule,
        ContabilidadModule,
        SriModule,
    ],
    controllers: [NotasCreditoController],
    providers: [NotasCreditoService],
    exports: [NotasCreditoService],
})
export class NotasCreditoModule { }
