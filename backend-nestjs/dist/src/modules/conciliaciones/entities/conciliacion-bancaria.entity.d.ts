import { Banco } from '../../bancos/entities/banco.entity';
import { Factura } from '../../facturas/entities/factura.entity';
export declare class ConciliacionBancaria {
    id: number;
    banco: Banco;
    banco_id: number;
    factura: Factura;
    factura_id: number;
    fecha: Date;
    fecha_valor: Date;
    referencia: string;
    descripcion: string;
    monto: number;
    tipo: string;
    forma_pago: string;
    metodo_pago: string;
    conciliado: boolean;
    fecha_conciliacion: Date;
    observaciones: string;
    created_at: Date;
    updated_at: Date;
}
