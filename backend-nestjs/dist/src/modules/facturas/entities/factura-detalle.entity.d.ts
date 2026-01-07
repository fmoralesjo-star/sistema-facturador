import { Factura } from './factura.entity';
import { Producto } from '../../productos/entities/producto.entity';
export declare class FacturaDetalle {
    id: number;
    factura: Factura;
    factura_id: number;
    producto: Producto;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    descuento: number;
    promocion_id: number;
}
