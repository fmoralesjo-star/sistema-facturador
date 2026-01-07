import { Albaran } from './albaran.entity';
import { Producto } from '../../productos/entities/producto.entity';
export declare class AlbaranDetalle {
    id: number;
    albaran: Albaran;
    albaran_id: number;
    producto: Producto;
    producto_id: number;
    cantidad_esperada: number;
    cantidad_recibida: number;
    cantidad_faltante: number;
    cantidad_danada: number;
    estado: string;
    observaciones: string;
    created_at: Date;
}
