import { Repository } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Compra } from '../compras/entities/compra.entity';
export declare class KpisService {
    private facturaRepository;
    private productoRepository;
    private compraRepository;
    constructor(facturaRepository: Repository<Factura>, productoRepository: Repository<Producto>, compraRepository: Repository<Compra>);
    private obtenerFechasPeriodo;
    calcularPuntoEquilibrio(periodo: string): Promise<{
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
    calcularMargenesUtilidad(fechaInicioStr: string, fechaFinStr: string): Promise<{
        totalVentas: number;
        costoVentas: number;
        utilidadBruta: number;
        margenBruto: number;
        gastosOperativos: number;
        utilidadNeta: number;
        margenNeto: number;
    }>;
    obtenerTopProductos(limite: number, periodo: string): Promise<{
        productoId: any;
        nombre: any;
        codigo: any;
        cantidadVendida: number;
        ingresosTotales: number;
    }[]>;
    calcularROI(fechaInicioStr: string, fechaFinStr: string): Promise<{
        ingresos: number;
        inversion: number;
        ganancia: number;
        roi: number;
        roiPorcentaje: string;
    }>;
    calcularRotacionInventario(periodo: string): Promise<{
        costoVentas: number;
        valorInventario: number;
        rotacionAnual: number;
        diasRotacion: number;
        velocidad: string;
    }>;
    calcularDiasCuentasCobrar(): Promise<{
        cuentasPorCobrar: number;
        ventasDiarias: number;
        diasCuentasCobrar: number;
        saludFinanciera: string;
    }>;
    calcularRatioCorriente(): Promise<{
        activosCorrientes: number;
        pasivosCorrientes: number;
        ratioCorriente: number;
        liquidez: string;
        interpretacion: string;
    }>;
    obtenerResumenCompleto(periodo: string): Promise<{
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
