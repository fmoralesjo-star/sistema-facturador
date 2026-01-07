import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../usuarios/entities/rol.entity';
import { Autorizacion2FA } from './entities/autorizacion-2fa.entity';
import { SolicitarRolContadorDto } from './dto/solicitar-rol-contador.dto';
import { Verificar2FADto } from './dto/verificar-2fa.dto';
export declare class AdministracionTIService {
    private usuarioRepository;
    private rolRepository;
    private autorizacion2FARepository;
    private usuariosService;
    constructor(usuarioRepository: Repository<Usuario>, rolRepository: Repository<Rol>, autorizacion2FARepository: Repository<Autorizacion2FA>, usuariosService: any);
    esAdministradorTI(usuarioId: number): Promise<boolean>;
    esDueñoEmpresa(usuarioId: number | string): Promise<boolean>;
    obtenerDueñoEmpresa(): Promise<Usuario | null>;
    private generarCodigoVerificacion;
    solicitarRolContador(adminTIId: number, solicitud: SolicitarRolContadorDto): Promise<{
        autorizacion_id: number;
        mensaje: string;
    }>;
    verificar2FA(dueñoId: number, verificarDto: Verificar2FADto): Promise<{
        success: boolean;
        mensaje: string;
    }>;
    obtenerAutorizacionesPendientes(dueñoId: number): Promise<Autorizacion2FA[]>;
    obtenerHistorialAutorizaciones(adminTIId: number): Promise<Autorizacion2FA[]>;
}
