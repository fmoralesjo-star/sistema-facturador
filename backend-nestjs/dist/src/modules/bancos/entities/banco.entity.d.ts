import { ConciliacionBancaria } from '../../conciliaciones/entities/conciliacion-bancaria.entity';
export declare class Banco {
    id: number;
    nombre: string;
    codigo: string;
    numero_cuenta: string;
    tipo_cuenta: string;
    saldo_inicial: number;
    saldo_actual: number;
    descripcion: string;
    activo: boolean;
    conciliaciones: ConciliacionBancaria[];
    created_at: Date;
    updated_at: Date;
}
