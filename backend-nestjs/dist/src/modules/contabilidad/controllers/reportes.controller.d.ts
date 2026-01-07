import { ReportesService } from '../services/reportes.service';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    balanceGeneral(fechaCorte?: string): Promise<import("../services/reportes.service").BalanceGeneral>;
    perdidasGanancias(fechaInicio: string, fechaFin: string): Promise<import("../services/reportes.service").EstadoPerdidasGanancias>;
    libroMayor(cuentaId: number, fechaInicio?: string, fechaFin?: string): Promise<import("../services/reportes.service").LibroMayorCuenta>;
    cuentasLibroMayor(): Promise<{
        id: number;
        codigo: string;
        nombre: string;
        tipo: string;
    }[]>;
}
