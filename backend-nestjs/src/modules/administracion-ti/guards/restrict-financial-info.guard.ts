import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { AdministracionTIService } from '../administracion-ti.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

/**
 * Guard que previene que los Administradores de TI accedan a información financiera
 */
@Injectable()
export class RestrictFinancialInfoGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AdministracionTIService))
    private administracionTIService: AdministracionTIService,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const firebaseUser = request.user;
    
    if (!firebaseUser || !firebaseUser.email) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Buscar usuario por email
    const usuario = await this.usuarioRepository.findOne({
      where: { email: firebaseUser.email },
    });

    if (!usuario) {
      return true; // Si no existe en BD, permitir acceso (puede ser un usuario nuevo)
    }

    const esAdminTI = await this.administracionTIService.esAdministradorTI(usuario.id);

    if (esAdminTI) {
      throw new ForbiddenException(
        'Los Administradores de TI no tienen acceso a información financiera. ' +
        'Este módulo está restringido para mantener la privacidad de los datos financieros.'
      );
    }

    return true;
  }
}

