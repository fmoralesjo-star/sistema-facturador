export declare class CreateConciliacionDto {
    banco_id: number;
    factura_id?: number;
    fecha: string;
    fecha_valor?: string;
    referencia?: string;
    descripcion?: string;
    monto: number;
    tipo: string;
    forma_pago?: string;
    metodo_pago?: string;
    conciliado?: boolean;
    observaciones?: string;
}
