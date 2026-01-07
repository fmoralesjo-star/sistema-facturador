export declare class CreateCompraDetalleDto {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
}
export declare class CreateCompraDto {
    proveedor_id?: number;
    fecha: string;
    numero?: string;
    autorizacion?: string;
    detalles: CreateCompraDetalleDto[];
    impuesto?: number;
    observaciones?: string;
    punto_venta_id?: number;
}
