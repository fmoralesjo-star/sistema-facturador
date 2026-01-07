import { TransferenciaDetalle } from './transferencia-detalle.entity';
import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';
export declare class Transferencia {
    id: number;
    numero: string;
    fecha: Date;
    origenPuntoVenta: PuntoVenta;
    origen_id: number;
    origen: string;
    destinoPuntoVenta: PuntoVenta;
    destino_id: number;
    destino: string;
    estado: string;
    usuario_envio: string;
    usuario_recepcion: string;
    fecha_envio: Date;
    fecha_recepcion: Date;
    observaciones: string;
    detalles: TransferenciaDetalle[];
    created_at: Date;
    updated_at: Date;
}
