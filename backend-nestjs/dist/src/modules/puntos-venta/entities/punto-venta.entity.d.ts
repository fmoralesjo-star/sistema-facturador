import { ProductoPuntoVenta } from '../../inventario/entities/producto-punto-venta.entity';
export declare class PuntoVenta {
    id: number;
    nombre: string;
    codigo: string;
    direccion: string;
    telefono: string;
    email: string;
    observaciones: string;
    tipo: string;
    es_principal: boolean;
    activo: boolean;
    secuencia_factura: number;
    secuencia_nota_credito: number;
    stocks: ProductoPuntoVenta[];
    created_at: Date;
    updated_at: Date;
}
