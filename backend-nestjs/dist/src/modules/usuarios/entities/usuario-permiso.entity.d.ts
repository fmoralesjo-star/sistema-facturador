import { Usuario } from './usuario.entity';
export declare class UsuarioPermiso {
    id: number;
    usuario_id: number;
    usuario: Usuario;
    modulo: string;
    tiene_acceso: number;
    created_at: Date;
    updated_at: Date;
}
