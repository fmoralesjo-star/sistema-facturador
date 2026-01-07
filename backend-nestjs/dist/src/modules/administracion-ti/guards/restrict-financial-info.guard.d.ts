import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AdministracionTIService } from '../administracion-ti.service';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare class RestrictFinancialInfoGuard implements CanActivate {
    private administracionTIService;
    private usuarioRepository;
    constructor(administracionTIService: AdministracionTIService, usuarioRepository: Repository<Usuario>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
