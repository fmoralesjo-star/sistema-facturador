export declare enum TipoMovimiento {
    DEBE = "DEBE",
    HABER = "HABER"
}
export declare enum TipoValor {
    TOTAL = "TOTAL",
    SUBTOTAL_15 = "SUBTOTAL_15",
    SUBTOTAL_0 = "SUBTOTAL_0",
    IVA = "IVA",
    DESCUENTO = "DESCUENTO",
    ICE = "ICE",
    PROPINA = "PROPINA",
    VALOR_FIJO = "VALOR_FIJO",
    RETENCION_RENTA = "RETENCION_RENTA",
    RETENCION_IVA = "RETENCION_IVA"
}
export declare class PlantillaDetalle {
    id: number;
    plantilla: any;
    plantilla_id: number;
    cuenta_codigo: string;
    tipo_movimiento: TipoMovimiento;
    tipo_valor: TipoValor;
    porcentaje: number;
    orden: number;
    referencia_opcional: string;
}
