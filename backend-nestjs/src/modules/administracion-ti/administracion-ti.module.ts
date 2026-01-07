import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministracionTIController } from './administracion-ti.controller';
import { AdministracionTIService } from './administracion-ti.service';
import { Autorizacion2FA } from './entities/autorizacion-2fa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../usuarios/entities/rol.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { RestrictFinancialInfoGuard } from './guards/restrict-financial-info.guard';

const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';

@Module({
  imports: [
    ...(useFirestore ? [] : [TypeOrmModule.forFeature([Autorizacion2FA, Usuario, Rol])]),
    forwardRef(() => UsuariosModule),
  ],
  controllers: [AdministracionTIController],
  providers: [AdministracionTIService, RestrictFinancialInfoGuard],
  exports: [
    AdministracionTIService,
    RestrictFinancialInfoGuard,
    ...(useFirestore ? [] : [TypeOrmModule]),
  ],
})
export class AdministracionTIModule { }

