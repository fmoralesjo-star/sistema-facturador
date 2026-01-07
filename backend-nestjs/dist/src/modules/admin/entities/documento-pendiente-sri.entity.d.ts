export declare class DocumentoPendienteSRI {
    id: number;
    tipo_documento: 'FACTURA' | 'NOTA_CREDITO' | 'ANULACION' | 'RETENCION';
    documento_id: number;
    numero_documento: string;
    cliente_nombre: string;
    xml_contenido: string;
    intentos: number;
    ultimo_intento: Date;
    ultimo_error: string;
    estado: 'PENDIENTE' | 'ENVIANDO' | 'AUTORIZADA' | 'ERROR_PERMANENTE';
    fecha_creacion: Date;
    fecha_autorizacion: Date;
    clave_acceso: string;
    numero_autorizacion: string;
    fecha_actualizacion: Date;
}
