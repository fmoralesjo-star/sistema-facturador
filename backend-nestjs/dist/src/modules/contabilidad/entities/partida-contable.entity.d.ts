import { CuentaContable } from './cuenta-contable.entity';
export declare class PartidaContable {
    id: number;
    asiento: any;
    asiento_id: number;
    cuenta: CuentaContable;
    cuenta_id: number;
    debe: number;
    haber: number;
    descripcion: string;
    tercero_id: number;
    tercero_tipo: string;
    centro_costo_id: number;
    sri_sustento_id: string;
    created_at: Date;
}
