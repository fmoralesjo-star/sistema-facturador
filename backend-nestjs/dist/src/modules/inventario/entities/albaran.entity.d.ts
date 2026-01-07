import { OrdenCompra } from './orden-compra.entity';
import { AlbaranDetalle } from './albaran-detalle.entity';
export declare class Albaran {
    id: number;
    numero: string;
    fecha_recepcion: Date;
    orden_compra: OrdenCompra;
    orden_compra_id: number;
    estado: string;
    observaciones: string;
    usuario_recepcion: string;
    detalles: AlbaranDetalle[];
    created_at: Date;
    updated_at: Date;
}
