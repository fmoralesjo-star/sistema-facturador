export declare class CreateTransferenciaDto {
    tipo: 'producto' | 'dinero';
    producto_id?: number;
    cantidad?: number;
    origen_id?: number;
    destino_id?: number;
    origen?: string;
    destino?: string;
    motivo?: string;
    fecha: Date;
    monto?: number;
    cuenta_origen?: string;
    cuenta_destino?: string;
    referencia?: string;
    estado?: string;
}
