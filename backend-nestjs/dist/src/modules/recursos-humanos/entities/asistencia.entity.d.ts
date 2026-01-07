import { Empleado } from './empleado.entity';
export declare class Asistencia {
    id: number;
    empleado: Empleado;
    empleado_id: number;
    fecha: Date;
    hora_entrada: string;
    hora_salida: string;
    tipo: string;
    observaciones: string;
    created_at: Date;
}
