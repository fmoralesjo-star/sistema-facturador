import { Picking } from './picking.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Ubicacion } from './ubicacion.entity';
export declare class PickingDetalle {
    id: number;
    picking: Picking;
    picking_id: number;
    producto: Producto;
    producto_id: number;
    ubicacion: Ubicacion;
    ubicacion_id: number;
    cantidad_solicitada: number;
    cantidad_picked: number;
    estado: string;
    orden_picking: number;
    created_at: Date;
}
