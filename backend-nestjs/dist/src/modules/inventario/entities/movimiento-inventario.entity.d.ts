import { Producto } from '../../productos/entities/producto.entity';
import { Factura } from '../../facturas/entities/factura.entity';
import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';
export declare class MovimientoInventario {
    id: number;
    producto: Producto;
    producto_id: number;
    fecha: Date;
    tipo: string;
    cantidad: number;
    motivo: string;
    observaciones: string;
    factura: Factura;
    factura_id: number;
    compra_id: number;
    puntoVenta: PuntoVenta;
    punto_venta_id: number;
    created_at: Date;
}
