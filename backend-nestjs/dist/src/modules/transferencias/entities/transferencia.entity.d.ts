import { Producto } from '../../productos/entities/producto.entity';
export declare class Transferencia {
    id: number;
    tipo: string;
    producto: Producto;
    producto_id: number;
    cantidad: number;
    origen: string;
    destino: string;
    motivo: string;
    fecha: Date;
    monto: number;
    cuenta_origen: string;
    cuenta_destino: string;
    referencia: string;
    estado: string;
    created_at: Date;
}
