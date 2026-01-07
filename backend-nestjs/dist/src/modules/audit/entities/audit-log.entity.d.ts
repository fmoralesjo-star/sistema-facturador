import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare class AuditLog {
    id: number;
    usuario_id: number;
    usuario: Usuario;
    usuario_nombre: string;
    accion: string;
    modulo: string;
    entidad_id: string;
    valor_anterior: string;
    valor_nuevo: string;
    ip_address: string;
    user_agent: string;
    created_at: Date;
    hash: string;
}
