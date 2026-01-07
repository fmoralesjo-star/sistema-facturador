import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Establecimiento } from './entities/establecimiento.entity';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { EstablecimientosService } from './establecimientos.service';
import { EstablecimientosController } from './establecimientos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa, Establecimiento])],
  controllers: [EmpresaController, EstablecimientosController],
  providers: [EmpresaService, EstablecimientosService],
  exports: [EmpresaService, EstablecimientosService],
})
export class EmpresaModule { }


















