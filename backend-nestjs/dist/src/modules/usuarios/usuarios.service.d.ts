import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioPermiso } from './entities/usuario-permiso.entity';
import { EventsGateway } from '../../gateways/events.gateway';
import { AuditService } from '../audit/audit.service';
export declare class CreateUsuarioDto {
    nombre_usuario: string;
    nombre_completo: string;
    password: string;
    email?: string;
    activo?: number;
    rol_id?: number;
}
export declare class UpdateUsuarioDto {
    nombre_usuario?: string;
    nombre_completo?: string;
    password?: string;
    email?: string;
    activo?: number;
    rol_id?: number;
}
export declare class PermisoDto {
    modulo: string;
    tiene_acceso: boolean;
}
export declare class UsuariosService {
    private usuarioRepository;
    private rolRepository;
    private permisoRepository;
    private eventsGateway;
    private readonly auditService;
    constructor(usuarioRepository: Repository<Usuario>, rolRepository: Repository<Rol>, permisoRepository: Repository<UsuarioPermiso>, eventsGateway: EventsGateway, auditService: AuditService);
    findAll(): Promise<Usuario[]>;
    findOne(id: number): Promise<Usuario>;
    findByUsername(nombre_usuario: string): Promise<Usuario>;
    create(createDto: CreateUsuarioDto): Promise<Usuario>;
    update(id: number, updateDto: UpdateUsuarioDto): Promise<Usuario>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getPermisos(usuarioId: number): Promise<UsuarioPermiso[]>;
    updatePermisos(usuarioId: number, permisos: PermisoDto[]): Promise<UsuarioPermiso[]>;
    findAllRoles(): Promise<Rol[]>;
    findOneRol(id: number): Promise<Rol>;
    aplicarPermisosPorRol(usuarioId: number, rolId: number): Promise<void>;
    private getPermisosPorRol;
    syncFirebaseUser(firebaseUid: string, email: string, nombreCompleto: string, extraData?: any): Promise<Usuario>;
}
