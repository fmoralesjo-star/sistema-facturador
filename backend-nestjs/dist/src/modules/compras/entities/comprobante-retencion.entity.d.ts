export declare enum EstadoRetencion {
    GENERADO = "GENERADO",
    FIRMADO = "FIRMADO",
    ENVIADO = "ENVIADO",
    AUTORIZADO = "AUTORIZADO",
    RECHAZADO = "RECHAZADO",
    ERROR = "ERROR"
}
export declare class ComprobanteRetencion {
    id: number;
    compra_id: number;
    clave_acceso: string;
    establecimiento: string;
    punto_emision: string;
    secuencial: string;
    fecha_emision: Date;
    proveedor_id: number;
    ruc_proveedor: string;
    razon_social_proveedor: string;
    codigo_sustento: string;
    tipo_doc_sustento: string;
    numero_doc_sustento: string;
    fecha_doc_sustento: Date;
    retencion_renta_codigo: string;
    retencion_renta_porcentaje: number;
    retencion_renta_base: number;
    retencion_renta_valor: number;
    retencion_iva_codigo: string;
    retencion_iva_porcentaje: number;
    retencion_iva_base: number;
    retencion_iva_valor: number;
    total_retenido: number;
    estado: string;
    numero_autorizacion: string;
    fecha_autorizacion: Date;
    xml_generado: string;
    xml_firmado: string;
    xml_autorizado: string;
    pdf_path: string;
    mensajes_sri: any;
    error_message: string;
    created_at: Date;
    updated_at: Date;
}
