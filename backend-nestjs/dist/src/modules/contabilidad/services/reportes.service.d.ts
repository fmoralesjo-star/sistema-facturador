import { Repository } from 'typeorm';
import { PartidaContable } from '../entities/partida-contable.entity';
import { CuentaContable } from '../entities/cuenta-contable.entity';
import { AsientoContable } from '../entities/asiento-contable.entity';
export interface BalanceGeneral {
    activos: {
        total: number;
        cuentas: Array<{
            codigo: string;
            nombre: string;
            saldo: number;
        }>;
    };
    pasivos: {
        total: number;
        cuentas: Array<{
            codigo: string;
            nombre: string;
            saldo: number;
        }>;
    };
    patrimonio: {
        total: number;
        cuentas: Array<{
            codigo: string;
            nombre: string;
            saldo: number;
        }>;
    };
    ecuacion: {
        activo_total: number;
        pasivo_patrimonio_total: number;
        balanceado: boolean;
        diferencia: number;
    };
}
export interface EstadoPerdidasGanancias {
    ingresos: {
        total: number;
        cuentas: Array<{
            codigo: string;
            nombre: string;
            saldo: number;
        }>;
    };
    costos: {
        total: number;
        cuentas: Array<{
            codigo: string;
            nombre: string;
            saldo: number;
        }>;
    };
    gastos: {
        total: number;
        cuentas: Array<{
            codigo: string;
            nombre: string;
            saldo: number;
        }>;
    };
    utilidad_bruta: number;
    utilidad_neta: number;
}
export interface LibroMayorCuenta {
    cuenta_id: number;
    codigo: string;
    nombre: string;
    tipo: string;
    saldo_inicial: number;
    movimientos: Array<{
        fecha: Date;
        numero_asiento: string;
        descripcion: string;
        debe: number;
        haber: number;
        saldo_acumulado: number;
    }>;
    saldo_final: number;
}
export declare class ReportesService {
    private partidaRepository;
    private cuentaRepository;
    private asientoRepository;
    constructor(partidaRepository: Repository<PartidaContable>, cuentaRepository: Repository<CuentaContable>, asientoRepository: Repository<AsientoContable>);
    generarBalanceGeneral(fechaCorte?: Date): Promise<BalanceGeneral>;
    generarEstadoPerdidasGanancias(fechaInicio: Date, fechaFin: Date): Promise<EstadoPerdidasGanancias>;
    generarLibroMayor(cuentaId: number, fechaInicio?: Date, fechaFin?: Date): Promise<LibroMayorCuenta>;
    private obtenerSaldosPorTipo;
    private obtenerSaldosPorTipoYFecha;
    obtenerCuentasParaLibroMayor(): Promise<Array<{
        id: number;
        codigo: string;
        nombre: string;
        tipo: string;
    }>>;
}
