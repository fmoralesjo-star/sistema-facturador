import { KpisService } from './kpis.service';
export declare class KpisController {
    private readonly kpisService;
    constructor(kpisService: KpisService);
    getPuntoEquilibrio(periodo?: string): Promise<{
        periodo: string;
        puntoEquilibrio: number;
        ventasRealizadas: number;
        porcentajeAlcanzado: number;
        costosFijos: number;
        precioPromedio: number;
        costoVariableUnitario: number;
        margenContribucion: number;
        estado: string;
    }>;
    getMargenesUtilidad(fechaInicio: string, fechaFin: string): Promise<{
        totalVentas: number;
        costoVentas: number;
        utilidadBruta: number;
        margenBruto: number;
        gastosOperativos: number;
        utilidadNeta: number;
        margenNeto: number;
    }>;
    getTopProductos(limite?: number, periodo?: string): Promise<{
        productoId: any;
        nombre: any;
        codigo: any;
        cantidadVendida: number;
        ingresosTotales: number;
    }[]>;
    getROI(fechaInicio: string, fechaFin: string): Promise<{
        ingresos: number;
        inversion: number;
        ganancia: number;
        roi: number;
        roiPorcentaje: string;
    }>;
    getRotacionInventario(periodo?: string): Promise<{
        costoVentas: number;
        valorInventario: number;
        rotacionAnual: number;
        diasRotacion: number;
        velocidad: string;
    }>;
    getDiasCuentasCobrar(): Promise<{
        cuentasPorCobrar: number;
        ventasDiarias: number;
        diasCuentasCobrar: number;
        saludFinanciera: string;
    }>;
    getRatioCorriente(): Promise<{
        activosCorrientes: number;
        pasivosCorrientes: number;
        ratioCorriente: number;
        liquidez: string;
        interpretacion: string;
    }>;
    getResumenCompleto(periodo?: string): Promise<{
        periodo: string;
        puntoEquilibrio: {
            periodo: string;
            puntoEquilibrio: number;
            ventasRealizadas: number;
            porcentajeAlcanzado: number;
            costosFijos: number;
            precioPromedio: number;
            costoVariableUnitario: number;
            margenContribucion: number;
            estado: string;
        };
        margenes: {
            totalVentas: number;
            costoVentas: number;
            utilidadBruta: number;
            margenBruto: number;
            gastosOperativos: number;
            utilidadNeta: number;
            margenNeto: number;
        };
        topProductos: {
            productoId: any;
            nombre: any;
            codigo: any;
            cantidadVendida: number;
            ingresosTotales: number;
        }[];
        roi: {
            ingresos: number;
            inversion: number;
            ganancia: number;
            roi: number;
            roiPorcentaje: string;
        };
        rotacionInventario: {
            costoVentas: number;
            valorInventario: number;
            rotacionAnual: number;
            diasRotacion: number;
            velocidad: string;
        };
        diasCuentasCobrar: {
            cuentasPorCobrar: number;
            ventasDiarias: number;
            diasCuentasCobrar: number;
            saludFinanciera: string;
        };
        ratioCorriente: {
            activosCorrientes: number;
            pasivosCorrientes: number;
            ratioCorriente: number;
            liquidez: string;
            interpretacion: string;
        };
    }>;
}
