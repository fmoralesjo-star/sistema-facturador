import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from './entities/configuracion.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ContingenciaService } from './contingencia.service';
import { ContingenciaScheduler } from './contingencia.scheduler';
import { AuditModule } from '../audit/audit.module';
import { Factura } from '../facturas/entities/factura.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { BackupLog } from './entities/backup-log.entity';
import { DocumentoPendienteSRI } from './entities/documento-pendiente-sri.entity';
import { EmailLog } from './entities/email-log.entity';
import { EmailService } from './email.service';

const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';

@Module({
  imports: [
    // Solo importar TypeORM si no se usa Firestore
    ...(useFirestore ? [] : [
      TypeOrmModule.forFeature([Factura, Producto, Cliente, BackupLog, DocumentoPendienteSRI, Configuracion, EmailLog]),
    ]),
    AuditModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, ContingenciaService, ContingenciaScheduler, EmailService],
  exports: [AdminService, ContingenciaService, EmailService],
})
export class AdminModule { }



