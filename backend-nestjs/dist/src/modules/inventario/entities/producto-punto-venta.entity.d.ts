import { Producto } from '../../productos/entities/producto.entity';
import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';
export declare class ProductoPuntoVenta {
    id: number;
    producto: Producto;
    producto_id: number;
    puntoVenta: PuntoVenta;
    punto_venta_id: number;
    stock: number;
    stock_minimo: number;
    observaciones: string;
    created_at: Date;
    updated_at: Date;
}
