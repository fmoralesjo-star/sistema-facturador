import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { AppModule } from '../../app.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    forwardRef(() => AppModule),
  ],
  controllers: [ProductosController],
  providers: [
    ProductosService,
    {
      provide: 'ProductosService',
      useClass: ProductosService,
    },
  ],
  exports: ['ProductosService'],
})
export class ProductosModule { }

