export declare class TransaccionBancaria {
    id: number;
    banco_id: number;
    fecha: Date;
    referencia: string;
    descripcion: string;
    tipo: string;
    monto: number;
    saldo: number;
    estado: string;
    conciliacion_id: number;
    asiento_contable_id: number;
    score_ia: number;
    metadata_ia: any;
    created_at: Date;
    updated_at: Date;
}
