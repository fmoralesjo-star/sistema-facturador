import { Asistencia } from './asistencia.entity';
export declare class Empleado {
    id: number;
    nombre: string;
    apellido: string;
    identificacion: string;
    email: string;
    telefono: string;
    fecha_nacimiento: Date;
    fecha_ingreso: Date;
    estado: string;
    activo: boolean;
    sueldo: number;
    asistencias: Asistencia[];
    created_at: Date;
    updated_at: Date;
}
