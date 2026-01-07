import { PickingDetalle } from './picking-detalle.entity';
export declare class Picking {
    id: number;
    numero: string;
    fecha: Date;
    orden_venta: string;
    estado: string;
    operario: string;
    fecha_inicio: Date;
    fecha_completado: Date;
    detalles: PickingDetalle[];
    created_at: Date;
    updated_at: Date;
}
