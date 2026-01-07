import { Repository } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';
import { Empleado } from '../recursos-humanos/entities/empleado.entity';
import { Promocion } from '../promociones/entities/promocion.entity';
import { CuentaContable } from '../contabilidad/entities/cuenta-contable.entity';
import { PartidaContable } from '../contabilidad/entities/partida-contable.entity';
export declare class ReportesService {
    private facturaRepository;
    private compraRepository;
    private productoRepository;
    private movimientoRepository;
    private empleadoRepository;
    private promocionRepository;
    private cuentaRepository;
    private partidaRepository;
    constructor(facturaRepository: Repository<Factura>, compraRepository: Repository<Compra>, productoRepository: Repository<Producto>, movimientoRepository: Repository<MovimientoInventario>, empleadoRepository: Repository<Empleado>, promocionRepository: Repository<Promocion>, cuentaRepository: Repository<CuentaContable>, partidaRepository: Repository<PartidaContable>);
    generarBalanceGeneral(fechaCorte: Date): Promise<{
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
    generarEstadoResultados(fechaInicio: Date, fechaFin: Date): Promise<{
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
    private construirArbolCuentas;
    private calcularSaldosRecursivo;
    private obtenerSaldoGrupo;
    reporteVentasPorVendedor(fechaInicio?: Date, fechaFin?: Date): Promise<any[]>;
    reporteProductosMasVendidos(fechaInicio?: Date, fechaFin?: Date, limite?: number): Promise<any[]>;
    reporteRotacionInventario(): Promise<{
        producto_id: number;
        producto_nombre: string;
        producto_codigo: string;
        stock_actual: number;
        total_entradas: number;
        total_salidas: number;
        rotacion: string;
    }[]>;
    reporteEfectividadPromociones(fechaInicio?: Date, fechaFin?: Date): Promise<{
        promocion_id: number;
        promocion_nombre: string;
        total_usos: number;
        facturas_aplicadas: number;
        total_descuento: number;
        efectividad: number;
    }[]>;
    reporteComprasVsVentas(fechaInicio?: Date, fechaFin?: Date): Promise<{
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
    generarLibroDiario(fechaInicio: Date, fechaFin: Date): Promise<import("typeorm").ObjectLiteral[]>;
    generarLibroMayor(fechaInicio: Date, fechaFin: Date, cuentaId?: number): Promise<any[]>;
    generarFlujoCaja(fechaInicio: Date, fechaFin: Date): Promise<{
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
