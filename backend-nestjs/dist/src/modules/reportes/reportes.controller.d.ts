import { ReportesService } from './reportes.service';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    reporteVentasPorVendedor(fechaInicio?: string, fechaFin?: string): Promise<any[]>;
    reporteProductosMasVendidos(fechaInicio?: string, fechaFin?: string, limite?: number): Promise<any[]>;
    reporteRotacionInventario(): Promise<{
        producto_id: number;
        producto_nombre: string;
        producto_codigo: string;
        stock_actual: number;
        total_entradas: number;
        total_salidas: number;
        rotacion: string;
    }[]>;
    reporteEfectividadPromociones(fechaInicio?: string, fechaFin?: string): Promise<{
        promocion_id: number;
        promocion_nombre: string;
        total_usos: number;
        facturas_aplicadas: number;
        total_descuento: number;
        efectividad: number;
    }[]>;
    reporteComprasVsVentas(fechaInicio?: string, fechaFin?: string): Promise<{
        compras: {
            total: number;
            cantidad: number;
        };
        ventas: {
            total: number;
            cantidad: number;
        };
        utilidad: number;
        margen: string;
    }>;
    balanceGeneral(fechaCorte: string): Promise<{
        fechaCorte: Date;
        activos: any[];
        pasivos: any[];
        patrimonio: any[];
        resumen: {
            total_activos: number;
            total_pasivos: number;
            total_patrimonio: number;
            ecuacion_contable: string;
        };
    }>;
    estadoResultados(fechaInicio: string, fechaFin: string): Promise<{
        fechaInicio: Date;
        fechaFin: Date;
        ingresos: any[];
        gastos: any[];
        costos: any[];
        resumen: {
            total_ingresos: number;
            total_gastos: number;
            total_costos: number;
            utilidad_bruta: number;
            utilidad_ejercicio: number;
        };
    }>;
    libroDiario(fechaInicio: string, fechaFin: string): Promise<import("typeorm").ObjectLiteral[]>;
    libroMayor(fechaInicio: string, fechaFin: string, cuentaId?: string): Promise<any[]>;
    flujoCaja(fechaInicio: string, fechaFin: string): Promise<{
        fechaInicio: Date;
        fechaFin: Date;
        contable: {
            ingresos_devengados: number;
            egresos_devengados: number;
            utilidad_contable: number;
        };
        real: {
            entradas_efectivo: number;
            salidas_efectivo: number;
            flujo_neto: number;
        };
        diferencia_ingresos: number;
        diferencia_egresos: number;
    }>;
}
