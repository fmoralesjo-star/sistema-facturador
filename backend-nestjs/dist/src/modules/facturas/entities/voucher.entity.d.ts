import { Factura } from './factura.entity';
export declare class Voucher {
    id: number;
    factura: Factura;
    factura_id: number;
    clave_acceso: string;
    xml_generado: string;
    xml_firmado: string;
    xml_autorizado: string;
    estado_sri: string;
    mensaje_sri: string;
    numero_autorizacion: string;
    fecha_autorizacion: Date;
    ambiente: string;
    ruta_pdf: string;
    observaciones: string;
    metadata: any;
    created_at: Date;
    updated_at: Date;
}
