import { ConteoCiclicoDetalle } from './conteo-ciclico-detalle.entity';
export declare class ConteoCiclico {
    id: number;
    numero: string;
    fecha: Date;
    categoria: string;
    ubicacion: string;
    estado: string;
    usuario_responsable: string;
    fecha_inicio: Date;
    fecha_completado: Date;
    observaciones: string;
    detalles: ConteoCiclicoDetalle[];
    created_at: Date;
    updated_at: Date;
}
