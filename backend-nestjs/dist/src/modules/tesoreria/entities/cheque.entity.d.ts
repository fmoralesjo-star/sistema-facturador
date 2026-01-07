export declare enum EstadoCheque {
    EMITIDO = "EMITIDO",
    ENTREGADO = "ENTREGADO",
    COBRADO = "COBRADO",
    ANULADO = "ANULADO",
    PROTESTADO = "PROTESTADO",
    DEPOSITADO = "DEPOSITADO"
}
export declare enum TipoCheque {
    GIRADO = "GIRADO",
    RECIBIDO = "RECIBIDO"
}
export declare class Cheque {
    id: number;
    numero: string;
    monto: number;
    fecha_emision: Date;
    fecha_pago: Date;
    beneficiario: string;
    tipo: TipoCheque;
    estado: EstadoCheque;
    banco: any;
    banco_id: number;
    proveedor: any;
    cliente: any;
    observaciones: string;
    created_at: Date;
    updated_at: Date;
}
