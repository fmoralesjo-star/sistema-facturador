import { Producto } from '../../productos/entities/producto.entity';
export declare class AjusteInventario {
    id: number;
    numero: string;
    fecha: Date;
    producto: Producto;
    producto_id: number;
    cantidad_anterior: number;
    cantidad_nueva: number;
    diferencia: number;
    motivo: string;
    motivo_detalle: string;
    usuario_responsable: string;
    observaciones: string;
    created_at: Date;
}
