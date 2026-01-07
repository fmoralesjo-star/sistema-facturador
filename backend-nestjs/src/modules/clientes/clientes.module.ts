import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesFirestoreService } from './clientes-firestore.service';
import { ClientesController } from './clientes.controller';
import { Cliente } from './entities/cliente.entity';
import { AppModule } from '../../app.module';
import { FirebaseModule } from '../firebase/firebase.module';

const useFirestore = process.env.USE_FIRESTORE === 'true';

@Module({
  imports: [
    ...(useFirestore ? [] : [TypeOrmModule.forFeature([Cliente])]),
    FirebaseModule,
    forwardRef(() => AppModule),
  ],
  controllers: [ClientesController],
  providers: [
    useFirestore ? ClientesFirestoreService : ClientesService,
    {
      provide: 'ClientesService',
      useClass: useFirestore ? ClientesFirestoreService : ClientesService,
    },
  ],
  exports: ['ClientesService'],
})
export class ClientesModule {}

