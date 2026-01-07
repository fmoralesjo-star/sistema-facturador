import { Producto } from '../../productos/entities/producto.entity';
export declare class LoteInventario {
    id: number;
    producto: Producto;
    producto_id: number;
    numero_lote: string;
    fecha_entrada: Date;
    fecha_vencimiento: Date;
    cantidad_inicial: number;
    cantidad_disponible: number;
    costo_unitario: number;
    precio_venta: number;
    proveedor: string;
    referencia_compra: string;
    observaciones: string;
    created_at: Date;
}
