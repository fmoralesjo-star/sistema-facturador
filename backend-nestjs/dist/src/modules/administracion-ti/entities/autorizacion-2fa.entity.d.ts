import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Rol } from '../../usuarios/entities/rol.entity';
export declare class Autorizacion2FA {
    id: number;
    usuario_solicitante_id: number;
    usuario_autorizador_id: number;
    rol_solicitado_id: number;
    codigo_verificacion: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'expirado';
    fecha_expiracion: Date;
    fecha_aprobacion: Date;
    created_at: Date;
    updated_at: Date;
    usuario_solicitante: Usuario;
    usuario_autorizador: Usuario;
    rol_solicitado: Rol;
}
