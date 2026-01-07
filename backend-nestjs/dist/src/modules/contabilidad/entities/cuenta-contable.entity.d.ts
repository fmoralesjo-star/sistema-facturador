export declare class CuentaContable {
    id: number;
    codigo: string;
    nombre: string;
    tipo: string;
    nivel: number;
    padre: CuentaContable;
    padre_id: number;
    hijos: CuentaContable[];
    activa: boolean;
    permite_movimiento: boolean;
    naturaleza: string;
    sri_codigo: string;
    requiere_auxiliar: boolean;
    requiere_centro_costo: boolean;
    descripcion: string;
    created_at: Date;
    updated_at: Date;
}
