import { Repository } from 'typeorm';
import { AsientoContable } from '../entities/asiento-contable.entity';
import { PartidaContable } from '../entities/partida-contable.entity';
import { CuentaContable } from '../entities/cuenta-contable.entity';
import { PlanCuentasService } from './plan-cuentas.service';
export declare class DatosEjemploService {
    private asientoRepository;
    private partidaRepository;
    private cuentaRepository;
    private planCuentasService;
    constructor(asientoRepository: Repository<AsientoContable>, partidaRepository: Repository<PartidaContable>, cuentaRepository: Repository<CuentaContable>, planCuentasService: PlanCuentasService);
    generarDatosEjemplo(): Promise<{
        success: boolean;
        message: string;
        asientos_creados: number;
        asientos: any[];
        resumen: {
            total_facturas_simuladas: number;
            total_ventas: number;
            total_iva: number;
            total_cobros: number;
        };
    }>;
    limpiarDatosEjemplo(): Promise<{
        success: boolean;
        message: string;
        asientos_eliminados: number;
    }>;
}
