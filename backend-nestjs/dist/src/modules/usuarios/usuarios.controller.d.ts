import { UsuariosService, CreateUsuarioDto, UpdateUsuarioDto, PermisoDto } from './usuarios.service';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    findAll(): Promise<import("./entities/usuario.entity").Usuario[]>;
    findAllRoles(): Promise<import("./entities/rol.entity").Rol[]>;
    findOneRol(id: number): Promise<import("./entities/rol.entity").Rol>;
    findOne(id: number): Promise<import("./entities/usuario.entity").Usuario>;
    getPermisos(id: number): Promise<import("./entities/usuario-permiso.entity").UsuarioPermiso[]>;
    create(createDto: CreateUsuarioDto): Promise<import("./entities/usuario.entity").Usuario>;
    update(id: number, updateDto: UpdateUsuarioDto): Promise<import("./entities/usuario.entity").Usuario>;
    updatePermisos(id: number, body: {
        permisos: PermisoDto[];
    }): Promise<import("./entities/usuario-permiso.entity").UsuarioPermiso[]>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    syncFirebaseUser(body: {
        firebase_uid: string;
        email: string;
        nombre_completo: string;
        identificacion?: string;
        telefono?: string;
        direccion?: string;
        fecha_nacimiento?: string;
        sueldo?: number;
        foto_cedula_anverso?: string;
        foto_cedula_reverso?: string;
    }): Promise<import("./entities/usuario.entity").Usuario>;
}
