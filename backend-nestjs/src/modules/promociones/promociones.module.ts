import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromocionesController } from './promociones.controller';
import { PromocionesService } from './promociones.service';
import { Promocion } from './entities/promocion.entity';
import { Producto } from '../productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promocion, Producto])],
  controllers: [PromocionesController],
  providers: [PromocionesService],
  exports: [PromocionesService],
})
export class PromocionesModule {}












