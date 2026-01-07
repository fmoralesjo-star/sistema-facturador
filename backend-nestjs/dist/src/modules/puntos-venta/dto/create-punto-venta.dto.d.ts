export declare class CreatePuntoVentaDto {
    nombre: string;
    codigo: string;
    direccion: string;
    telefono?: string;
    email?: string;
    observaciones?: string;
    tipo: string;
    es_principal?: boolean;
    secuencia_factura?: number;
    secuencia_nota_credito?: number;
}
