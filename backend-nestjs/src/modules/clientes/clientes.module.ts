import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Cliente } from './entities/cliente.entity';
import { AppModule } from '../../app.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente]),
    forwardRef(() => AppModule),
  ],
  controllers: [ClientesController],
  providers: [
    ClientesService,
    {
      provide: 'ClientesService',
      useClass: ClientesService,
    },
  ],
  exports: ['ClientesService'],
})
export class ClientesModule { }

