import { Rol } from './rol.entity';
import { UsuarioPermiso } from './usuario-permiso.entity';
export declare class Usuario {
    id: number;
    nombre_usuario: string;
    nombre_completo: string;
    password: string;
    email: string;
    activo: number;
    rol_id: number;
    rol: Rol;
    permisos: UsuarioPermiso[];
    identificacion: string;
    telefono: string;
    direccion: string;
    fecha_nacimiento: Date;
    fecha_ingreso: Date;
    sueldo: number;
    foto_cedula_anverso: string;
    foto_cedula_reverso: string;
    created_at: Date;
    updated_at: Date;
}
