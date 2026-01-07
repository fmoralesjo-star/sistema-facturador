import { Transferencia } from './transferencia.entity';
import { Producto } from '../../productos/entities/producto.entity';
export declare class TransferenciaDetalle {
    id: number;
    transferencia: Transferencia;
    transferencia_id: number;
    producto: Producto;
    producto_id: number;
    cantidad: number;
    cantidad_recibida: number;
    created_at: Date;
}
