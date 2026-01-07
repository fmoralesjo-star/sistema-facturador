import { Factura } from '../../facturas/entities/factura.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
export declare class NotaCredito {
    id: number;
    numero: string;
    fecha: Date;
    factura: Factura;
    factura_id: number;
    cliente: Cliente;
    cliente_id: number;
    subtotal: number;
    impuesto: number;
    total: number;
    motivo: string;
    estado: string;
    clave_acceso: string;
    autorizacion: string;
    fecha_autorizacion: Date;
    info_adicional: {
        nombre: string;
        valor: string;
    }[];
    detalles: NotaCreditoDetalle[];
    created_at: Date;
    updated_at: Date;
}
export declare class NotaCreditoDetalle {
    id: number;
    notaCredito: NotaCredito;
    nota_credito_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}
