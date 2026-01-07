import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuntosVentaService } from './puntos-venta.service';
import { PuntosVentaController } from './puntos-venta.controller';
import { PuntoVenta } from './entities/punto-venta.entity';
import { Establecimiento } from '../empresa/entities/establecimiento.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PuntoVenta, Establecimiento])],
    controllers: [PuntosVentaController],
    providers: [PuntosVentaService],
    exports: [PuntosVentaService],
})
export class PuntosVentaModule { }
