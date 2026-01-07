import { CategoriaGasto } from '../entities/caja-chica-movimiento.entity';
export declare class CreateCajaChicaMovimientoDto {
    punto_venta_id: number;
    tipo: 'INGRESO' | 'GASTO';
    categoria?: CategoriaGasto;
    es_deducible?: boolean;
    monto: number;
    descripcion: string;
    referencia?: string;
    numero_documento?: string;
    proveedor_nombre?: string;
    usuario_id: number;
}
