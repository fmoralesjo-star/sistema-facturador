import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursosHumanosController } from './recursos-humanos.controller';
import { RecursosHumanosService } from './recursos-humanos.service';
import { Empleado } from './entities/empleado.entity';
import { Asistencia } from './entities/asistencia.entity';

import { ContabilidadModule } from '../contabilidad/contabilidad.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empleado, Asistencia]),
    ContabilidadModule,
  ],
  controllers: [RecursosHumanosController],
  providers: [RecursosHumanosService],
  exports: [RecursosHumanosService],
})
export class RecursosHumanosModule { }












