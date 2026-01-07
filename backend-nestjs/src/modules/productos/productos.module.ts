import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosFirestoreService } from './productos-firestore.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { AppModule } from '../../app.module';
import { FirebaseModule } from '../firebase/firebase.module';

const useFirestore = process.env.USE_FIRESTORE === 'true';

@Module({
  imports: [
    ...(useFirestore ? [] : [TypeOrmModule.forFeature([Producto])]),
    FirebaseModule,
    forwardRef(() => AppModule),
  ],
  controllers: [ProductosController],
  providers: [
    useFirestore ? ProductosFirestoreService : ProductosService,
    {
      provide: 'ProductosService',
      useClass: useFirestore ? ProductosFirestoreService : ProductosService,
    },
  ],
  exports: ['ProductosService'],
})
export class ProductosModule {}

