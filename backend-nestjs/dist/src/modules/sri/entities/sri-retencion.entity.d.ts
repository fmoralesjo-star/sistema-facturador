export declare enum TipoRetencion {
    RENTA = "RENTA",
    IVA = "IVA",
    ISD = "ISD"
}
export declare class SriRetencion {
    id: number;
    codigo: string;
    descripcion: string;
    porcentaje: number;
    tipo: TipoRetencion;
    fecha_vigencia_inicio: Date;
    fecha_vigencia_fin: Date;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}
