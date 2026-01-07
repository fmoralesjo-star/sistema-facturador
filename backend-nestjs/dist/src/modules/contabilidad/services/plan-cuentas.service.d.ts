import { Repository } from 'typeorm';
import { CuentaContable } from '../entities/cuenta-contable.entity';
export interface CreateCuentaDto {
    codigo: string;
    nombre: string;
    tipo: string;
    padre_id?: number;
    descripcion?: string;
    permite_movimiento?: boolean;
    naturaleza?: 'DEUDORA' | 'ACREEDORA';
    sri_codigo?: string;
    requiere_auxiliar?: boolean;
    requiere_centro_costo?: boolean;
}
export interface UpdateCuentaDto {
    nombre?: string;
    descripcion?: string;
    activa?: boolean;
    permite_movimiento?: boolean;
    naturaleza?: 'DEUDORA' | 'ACREEDORA';
    sri_codigo?: string;
    requiere_auxiliar?: boolean;
    requiere_centro_costo?: boolean;
}
export declare class PlanCuentasService {
    private cuentaRepository;
    constructor(cuentaRepository: Repository<CuentaContable>);
    create(createDto: CreateCuentaDto): Promise<CuentaContable>;
    findAll(): Promise<CuentaContable[]>;
    findOne(id: number): Promise<CuentaContable>;
    findByCodigo(codigo: string): Promise<CuentaContable>;
    findCuentasMovimiento(): Promise<CuentaContable[]>;
    update(id: number, updateDto: UpdateCuentaDto): Promise<CuentaContable>;
    remove(id: number): Promise<void>;
    removeAll(): Promise<void>;
    inicializarPlanBasico(): Promise<void>;
    private validarFormatoCodigo;
    private construirArbol;
}
