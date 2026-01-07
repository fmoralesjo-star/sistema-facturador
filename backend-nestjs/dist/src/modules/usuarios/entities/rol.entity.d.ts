import { Usuario } from './usuario.entity';
export declare class Rol {
    id: number;
    nombre: string;
    descripcion: string;
    usuarios: Usuario[];
    created_at: Date;
    updated_at: Date;
}
