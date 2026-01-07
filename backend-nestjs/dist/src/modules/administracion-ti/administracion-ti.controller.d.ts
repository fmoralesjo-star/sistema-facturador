import { AdministracionTIService } from './administracion-ti.service';
import { SolicitarRolContadorDto } from './dto/solicitar-rol-contador.dto';
import { Verificar2FADto } from './dto/verificar-2fa.dto';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
export declare class AdministracionTIController {
    private readonly administracionTIService;
    private usuarioRepository;
    private readonly usuariosService;
    constructor(administracionTIService: AdministracionTIService, usuarioRepository: Repository<Usuario>, usuariosService: UsuariosService);
    private obtenerUsuarioId;
    verificarAdminTI(req: any): Promise<{
        esAdminTI: boolean;
        usuarioId: number;
        mensaje: string;
    }>;
    solicitarRolContador(req: any, solicitud: SolicitarRolContadorDto): Promise<{
        autorizacion_id: number;
        mensaje: string;
    }>;
    verificar2FA(req: any, verificarDto: Verificar2FADto): Promise<{
        success: boolean;
        mensaje: string;
    }>;
    obtenerAutorizacionesPendientes(req: any): Promise<import("./entities/autorizacion-2fa.entity").Autorizacion2FA[]>;
    obtenerHistorialAutorizaciones(req: any): Promise<import("./entities/autorizacion-2fa.entity").Autorizacion2FA[]>;
}
