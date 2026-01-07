import { Factura } from '../../facturas/entities/factura.entity';
export declare class Cliente {
    id: number;
    nombre: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    fechaNacimiento: Date;
    esExtranjero: boolean;
    facturas: Factura[];
    notas: string;
    limite_credito: number;
    tipo_cliente: string;
    total_compras_historico: number;
    cantidad_compras: number;
    ultima_compra: Date;
    created_at: Date;
    updated_at: Date;
}
