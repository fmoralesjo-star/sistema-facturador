import { CompraDetalle } from './compra-detalle.entity';
import { Proveedor } from './proveedor.entity';
export declare class Compra {
    id: number;
    numero: string;
    autorizacion: string;
    proveedor: Proveedor;
    proveedor_id: number;
    punto_venta_id: number;
    fecha: Date;
    subtotal: number;
    impuesto: number;
    total: number;
    estado: string;
    asiento_contable_creado: boolean;
    observaciones: string;
    retencion_renta_codigo: string;
    retencion_renta_porcentaje: number;
    retencion_renta_valor: number;
    retencion_iva_codigo: string;
    retencion_iva_porcentaje: number;
    retencion_iva_valor: number;
    detalles: CompraDetalle[];
    created_at: Date;
    updated_at: Date;
}
