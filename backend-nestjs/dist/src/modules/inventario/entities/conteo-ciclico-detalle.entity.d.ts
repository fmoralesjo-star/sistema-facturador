import { ConteoCiclico } from './conteo-ciclico.entity';
import { Producto } from '../../productos/entities/producto.entity';
export declare class ConteoCiclicoDetalle {
    id: number;
    conteo: ConteoCiclico;
    conteo_id: number;
    producto: Producto;
    producto_id: number;
    cantidad_sistema: number;
    cantidad_fisica: number;
    diferencia: number;
    estado: string;
    observaciones: string;
    created_at: Date;
}
