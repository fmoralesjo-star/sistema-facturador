export declare enum OrigenAsiento {
    VENTAS = "VENTAS",
    COMPRAS = "COMPRAS",
    TESORERIA = "TESORERIA",
    INVENTARIO = "INVENTARIO",
    NOMINA = "NOMINA"
}
export declare class PlantillaAsiento {
    id: number;
    codigo: string;
    nombre: string;
    origen: OrigenAsiento;
    descripcion: string;
    activo: boolean;
    detalles: any[];
    created_at: Date;
    updated_at: Date;
}
