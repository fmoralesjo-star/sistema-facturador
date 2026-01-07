import { Compra } from './compra.entity';
import { Producto } from '../../productos/entities/producto.entity';
export declare class CompraDetalle {
    id: number;
    compra: Compra;
    compra_id: number;
    producto: Producto;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}
