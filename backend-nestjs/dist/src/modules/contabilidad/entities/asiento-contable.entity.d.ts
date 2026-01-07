export declare class AsientoContable {
    id: number;
    numero_asiento: string;
    fecha: Date;
    descripcion: string;
    tipo: string;
    total_debe: number;
    total_haber: number;
    factura: any;
    factura_id: number;
    origen_modulo: string;
    origen_id: number;
    estado: string;
    partidas: any[];
    created_at: Date;
    deleted_at: Date;
}
