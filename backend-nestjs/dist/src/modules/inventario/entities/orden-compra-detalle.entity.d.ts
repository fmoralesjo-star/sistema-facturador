import { OrdenCompra } from './orden-compra.entity';
import { Producto } from '../../productos/entities/producto.entity';
export declare class OrdenCompraDetalle {
    id: number;
    orden_compra: OrdenCompra;
    orden_compra_id: number;
    producto: Producto;
    producto_id: number;
    cantidad_pedida: number;
    cantidad_recibida: number;
    precio_unitario: number;
    created_at: Date;
}
