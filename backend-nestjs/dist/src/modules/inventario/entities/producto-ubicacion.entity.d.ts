import { Producto } from '../../productos/entities/producto.entity';
import { Ubicacion } from './ubicacion.entity';
export declare class ProductoUbicacion {
    id: number;
    producto: Producto;
    producto_id: number;
    ubicacion: Ubicacion;
    ubicacion_id: number;
    stock: number;
    stock_minimo: number;
    stock_maximo: number;
    estado_stock: string;
    observaciones: string;
    created_at: Date;
    updated_at: Date;
}
