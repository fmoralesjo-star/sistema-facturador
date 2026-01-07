import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciliacionesService } from './conciliaciones.service';
import { ConciliacionesController } from './conciliaciones.controller';
import { ConciliacionBancaria } from './entities/conciliacion-bancaria.entity';
import { MovimientoBancarioExtracto } from './entities/movimiento-bancario-extracto.entity';
import { TransaccionBancaria } from './entities/transaccion-bancaria.entity';
import { ConciliacionIAService } from './conciliacion-ia.service';
import { BancosModule } from '../bancos/bancos.module';
import { ContabilidadModule } from '../contabilidad/contabilidad.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConciliacionBancaria, MovimientoBancarioExtracto, TransaccionBancaria]),
    BancosModule,
    ContabilidadModule,
  ],
  controllers: [ConciliacionesController],
  providers: [ConciliacionesService, ConciliacionIAService],
  exports: [ConciliacionesService],
})
export class ConciliacionesModule { }












