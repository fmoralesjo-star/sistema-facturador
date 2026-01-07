import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioPermiso } from './entities/usuario-permiso.entity';
import { AppModule } from '../../app.module';
import { InsertarRolesService } from './scripts/insertar-roles.service';
import { CrearUsuariosPruebaService } from './scripts/crear-usuarios-prueba.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, UsuarioPermiso]),
    forwardRef(() => AppModule),
    AuditModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService, InsertarRolesService, CrearUsuariosPruebaService],
  exports: [UsuariosService],
})
export class UsuariosModule { }

