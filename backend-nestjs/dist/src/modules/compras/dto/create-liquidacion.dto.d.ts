export declare class CreateLiquidacionDto {
    fecha_emision: string;
    proveedor_identificacion: string;
    proveedor_nombre: string;
    proveedor_direccion?: string;
    proveedor_telefono?: string;
    proveedor_email?: string;
    concepto: string;
    subtotal_0: number;
    subtotal_12: number;
    iva: number;
    total: number;
    retencion_renta?: number;
    retencion_iva?: number;
    codigo_retencion_renta?: string;
    codigo_retencion_iva?: string;
    observaciones?: string;
}
