export declare class CreateFacturaDetalleDto {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
}
export declare class CreateFacturaDto {
    cliente_id: number;
    fecha: string;
    numero?: string;
    detalles: CreateFacturaDetalleDto[];
    impuesto?: number;
    establecimiento?: string;
    punto_emision?: string;
    secuencial?: string;
    tipo_comprobante?: string;
    ambiente?: string;
    forma_pago?: string;
    condicion_pago?: string;
    retencion_numero?: string;
    retencion_valor_ir?: number;
    retencion_valor_iva?: number;
    retencion_fecha?: Date;
    emisor_ruc?: string;
    emisor_razon_social?: string;
    emisor_nombre_comercial?: string;
    empresa_id?: number;
    observaciones_contables?: string;
    vendedor_id?: number;
    punto_venta_id?: number;
    pagos?: Array<{
        codigo: string;
        monto: number;
        formaPago: string;
        metodoPago: string;
        tipoPago: string;
        banco_id?: number;
    }>;
}
