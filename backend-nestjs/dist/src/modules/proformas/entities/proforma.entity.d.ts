import { Cliente } from '../../clientes/entities/cliente.entity';
import { ProformaDetalle } from './proforma-detalle.entity';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { Empleado } from '../../recursos-humanos/entities/empleado.entity';
export declare class Proforma {
    id: number;
    numero: string;
    cliente: Cliente;
    cliente_id: number;
    empresa: Empresa;
    empresa_id: number;
    vendedor: Empleado;
    vendedor_id: number;
    fecha: Date;
    fecha_validez: Date;
    subtotal: number;
    impuesto: number;
    total: number;
    estado: string;
    observaciones: string;
    cliente_nombre: string;
    cliente_ruc: string;
    cliente_direccion: string;
    cliente_telefono: string;
    cliente_email: string;
    detalles: ProformaDetalle[];
    created_at: Date;
    updated_at: Date;
}
