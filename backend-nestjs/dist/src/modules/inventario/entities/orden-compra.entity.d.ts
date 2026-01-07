import { OrdenCompraDetalle } from './orden-compra-detalle.entity';
import { Albaran } from './albaran.entity';
export declare class OrdenCompra {
    id: number;
    numero: string;
    fecha_orden: Date;
    fecha_esperada: Date;
    proveedor: string;
    estado: string;
    observaciones: string;
    detalles: OrdenCompraDetalle[];
    albaranes: Albaran[];
    created_at: Date;
    updated_at: Date;
}
