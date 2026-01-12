import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Compra } from '../compras/entities/compra.entity';
import { PuntoVenta } from '../puntos-venta/entities/punto-venta.entity';

@Injectable()
export class KpisService {
    constructor(
        @InjectRepository(Factura)
        private facturaRepository: Repository<Factura>,
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,
        @InjectRepository(Compra)
        private compraRepository: Repository<Compra>,
        @InjectRepository(PuntoVenta)
        private puntoVentaRepository: Repository<PuntoVenta>,
    ) { }

    private obtenerFechasPeriodo(periodo: string): { fechaInicio: Date; fechaFin: Date } {
        const hoy = new Date();
        let fechaInicio: Date;
        const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

        switch (periodo) {
            case 'dia':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
                break;
            case 'semana':
                fechaInicio = new Date(hoy);
                fechaInicio.setDate(hoy.getDate() - 7);
                break;
            case 'mes':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                break;
            case 'trimestre':
                const mesInicio = Math.floor(hoy.getMonth() / 3) * 3;
                fechaInicio = new Date(hoy.getFullYear(), mesInicio, 1);
                break;
            case 'año':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                break;
            default:
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        }

        return { fechaInicio, fechaFin };
    }

    async calcularPuntoEquilibrio(periodo: string) {
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo(periodo);

        // Obtener ventas del período
        const ventas = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total_ventas')
            .addSelect('COUNT(factura.id)', 'cantidad_ventas')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();

        // Obtener costos de compras (costo variable)
        const compras = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total_compras')
            .where('compra.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .getRawOne();

        const totalVentas = parseFloat(ventas?.total_ventas || '0');
        const cantidadVentas = parseInt(ventas?.cantidad_ventas || '0');
        const totalCompras = parseFloat(compras?.total_compras || '0');

        // Estimar costos fijos mensuales (puedes ajustar este valor)
        const costosFijosMensuales = 5000; // Estimación de alquiler, salarios, servicios

        const precioPromedio = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;
        const costoVariableUnitario = cantidadVentas > 0 ? totalCompras / cantidadVentas : 0;

        let puntoEquilibrio = 0;
        if (precioPromedio > costoVariableUnitario) {
            puntoEquilibrio = costosFijosMensuales / (precioPromedio - costoVariableUnitario);
        }

        const ventasRealizadas = cantidadVentas;
        const porcentajeAlcanzado = puntoEquilibrio > 0 ? (ventasRealizadas / puntoEquilibrio) * 100 : 0;

        return {
            periodo,
            puntoEquilibrio: Math.round(puntoEquilibrio),
            ventasRealizadas,
            porcentajeAlcanzado: parseFloat(porcentajeAlcanzado.toFixed(2)),
            costosFijos: costosFijosMensuales,
            precioPromedio: parseFloat(precioPromedio.toFixed(2)),
            costoVariableUnitario: parseFloat(costoVariableUnitario.toFixed(2)),
            margenContribucion: parseFloat((precioPromedio - costoVariableUnitario).toFixed(2)),
            estado: ventasRealizadas >= puntoEquilibrio ? 'superado' : 'pendiente'
        };
    }

    async calcularMargenesUtilidad(fechaInicioStr: string, fechaFinStr: string) {
        const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr) : this.obtenerFechasPeriodo('mes').fechaInicio;
        const fechaFin = fechaFinStr ? new Date(fechaFinStr) : this.obtenerFechasPeriodo('mes').fechaFin;

        // Total ventas
        const ventas = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.subtotal)', 'subtotal')
            .addSelect('SUM(factura.impuesto)', 'impuesto')
            .addSelect('SUM(factura.total)', 'total')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();

        // Total compras (costo de ventas)
        const compras = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total_compras')
            .where('compra.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .getRawOne();

        const totalVentas = parseFloat(ventas?.total || '0');
        const totalCompras = parseFloat(compras?.total_compras || '0');

        // Estimación de gastos operativos (10% de ventas como ejemplo)
        const gastosOperativos = totalVentas * 0.10;

        const utilidadBruta = totalVentas - totalCompras;
        const utilidadNeta = utilidadBruta - gastosOperativos;

        const margenBruto = totalVentas > 0 ? (utilidadBruta / totalVentas) * 100 : 0;
        const margenNeto = totalVentas > 0 ? (utilidadNeta / totalVentas) * 100 : 0;

        return {
            totalVentas: parseFloat(totalVentas.toFixed(2)),
            costoVentas: parseFloat(totalCompras.toFixed(2)),
            utilidadBruta: parseFloat(utilidadBruta.toFixed(2)),
            margenBruto: parseFloat(margenBruto.toFixed(2)),
            gastosOperativos: parseFloat(gastosOperativos.toFixed(2)),
            utilidadNeta: parseFloat(utilidadNeta.toFixed(2)),
            margenNeto: parseFloat(margenNeto.toFixed(2))
        };
    }

    async obtenerTopProductos(limite: number, periodo: string) {
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo(periodo);

        const topProductos = await this.facturaRepository
            .createQueryBuilder('factura')
            .innerJoin('factura.detalles', 'detalle')
            .innerJoin('detalle.producto', 'producto')
            .select('producto.id', 'producto_id')
            .addSelect('producto.nombre', 'nombre')
            .addSelect('producto.codigo', 'codigo')
            .addSelect('SUM(detalle.cantidad)', 'cantidad_vendida')
            .addSelect('SUM(detalle.subtotal)', 'ingresos_totales')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .groupBy('producto.id')
            .addGroupBy('producto.nombre')
            .addGroupBy('producto.codigo')
            .orderBy('cantidad_vendida', 'DESC')
            .limit(limite)
            .getRawMany();

        return topProductos.map(p => ({
            productoId: p.producto_id,
            nombre: p.nombre,
            codigo: p.codigo,
            cantidadVendida: parseInt(p.cantidad_vendida),
            ingresosTotales: parseFloat(parseFloat(p.ingresos_totales).toFixed(2))
        }));
    }

    async calcularROI(fechaInicioStr: string, fechaFinStr: string) {
        const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr) : this.obtenerFechasPeriodo('mes').fechaInicio;
        const fechaFin = fechaFinStr ? new Date(fechaFinStr) : this.obtenerFechasPeriodo('mes').fechaFin;

        // Ingresos (ventas)
        const ventas = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();

        // Inversión (compras + gastos estimados)
        const compras = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total')
            .where('compra.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .getRawOne();

        const ingresos = parseFloat(ventas?.total || '0');
        const inversion = parseFloat(compras?.total || '0');

        const ganancia = ingresos - inversion;
        const roi = inversion > 0 ? (ganancia / inversion) * 100 : 0;

        return {
            ingresos: parseFloat(ingresos.toFixed(2)),
            inversion: parseFloat(inversion.toFixed(2)),
            ganancia: parseFloat(ganancia.toFixed(2)),
            roi: parseFloat(roi.toFixed(2)),
            roiPorcentaje: `${roi.toFixed(2)}%`
        };
    }

    async calcularRotacionInventario(periodo: string) {
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo(periodo);

        // Costo de ventas
        const compras = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total')
            .where('compra.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .getRawOne();

        // Inventario promedio (suma de todos los productos por su costo)
        const inventario = await this.productoRepository
            .createQueryBuilder('producto')
            .select('SUM(producto.stock * producto.costo)', 'valor_inventario')
            .getRawOne();

        const costoVentas = parseFloat(compras?.total || '0');
        const valorInventario = parseFloat(inventario?.valor_inventario || '1');

        const rotacion = valorInventario > 0 ? costoVentas / valorInventario : 0;
        const diasRotacion = rotacion > 0 ? 365 / rotacion : 0;

        return {
            costoVentas: parseFloat(costoVentas.toFixed(2)),
            valorInventario: parseFloat(valorInventario.toFixed(2)),
            rotacionAnual: parseFloat(rotacion.toFixed(2)),
            diasRotacion: parseFloat(diasRotacion.toFixed(0)),
            velocidad: rotacion >= 6 ? 'Alta' : rotacion >= 3 ? 'Media' : 'Baja'
        };
    }

    async calcularDiasCuentasCobrar() {
        // Total de cuentas por cobrar (facturas pendientes de pago)
        const cuentasPorCobrar = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total')
            .where('factura.estado = :estado', { estado: 'AUTORIZADA' })
            // Aquí se podría filtrar por facturas con saldo pendiente si tienes ese campo
            .getRawOne();

        // Ventas promedio diarias del último mes
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo('mes');
        const ventas = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();

        const totalCuentasCobrar = parseFloat(cuentasPorCobrar?.total || '0');
        const ventasMes = parseFloat(ventas?.total || '0');
        const ventasDiarias = ventasMes / 30;

        const diasCuentasCobrar = ventasDiarias > 0 ? totalCuentasCobrar / ventasDiarias : 0;

        return {
            cuentasPorCobrar: parseFloat(totalCuentasCobrar.toFixed(2)),
            ventasDiarias: parseFloat(ventasDiarias.toFixed(2)),
            diasCuentasCobrar: parseFloat(diasCuentasCobrar.toFixed(0)),
            saludFinanciera: diasCuentasCobrar <= 30 ? 'Buena' : diasCuentasCobrar <= 60 ? 'Regular' : 'Requiere Atención'
        };
    }

    async calcularRatioCorriente() {
        // Activos corrientes: efectivo + cuentas por cobrar + inventario
        const cuentasCobrar = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total')
            .where('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();

        const inventario = await this.productoRepository
            .createQueryBuilder('producto')
            .select('SUM(producto.stock * producto.costo)', 'valor')
            .getRawOne();

        // Pasivos corrientes: cuentas por pagar (estimación)
        const cuentasPagar = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total')
            .where('compra.estado IS NULL OR compra.estado != :estado', { estado: 'PAGADA' })
            .getRawOne();

        const activosCorrientes =
            parseFloat(cuentasCobrar?.total || '0') +
            parseFloat(inventario?.valor || '0') +
            10000; // Efectivo estimado (puedes conectar con caja si tienes ese módulo)

        const pasivosCorrientes = parseFloat(cuentasPagar?.total || '1');

        const ratioCorriente = pasivosCorrientes > 0 ? activosCorrientes / pasivosCorrientes : 0;

        return {
            activosCorrientes: parseFloat(activosCorrientes.toFixed(2)),
            pasivosCorrientes: parseFloat(pasivosCorrientes.toFixed(2)),
            ratioCorriente: parseFloat(ratioCorriente.toFixed(2)),
            liquidez: ratioCorriente >= 2 ? 'Excelente' : ratioCorriente >= 1.5 ? 'Buena' : ratioCorriente >= 1 ? 'Aceptable' : 'Deficiente',
            interpretacion: ratioCorriente >= 1
                ? 'La empresa puede cubrir sus deudas a corto plazo'
                : 'Riesgo de liquidez - Revisar flujo de caja'
        };
    }

    async obtenerResumenCompleto(periodo: string) {
        const [
            puntoEquilibrio,
            margenes,
            topProductos,
            roi,
            rotacion,
            diasCobrar,
            ratioCorriente
        ] = await Promise.all([
            this.calcularPuntoEquilibrio(periodo),
            this.calcularMargenesUtilidad(null, null),
            this.obtenerTopProductos(5, periodo),
            this.calcularROI(null, null),
            this.calcularRotacionInventario(periodo),
            this.calcularDiasCuentasCobrar(),
            this.calcularRatioCorriente()
        ]);

        return {
            periodo,
            puntoEquilibrio,
            margenes,
            topProductos,
            roi,
            rotacionInventario: rotacion,
            diasCuentasCobrar: diasCobrar,
            ratioCorriente
        };
    }

    async obtenerVentasPorVendedor(periodo: string) {
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo(periodo);

        const resultados = await this.facturaRepository
            .createQueryBuilder('factura')
            .leftJoinAndSelect('factura.vendedor', 'vendedor') // Using 'vendedor' relation (mapped to Empleado)
            .select('vendedor.nombres', 'nombre_vendedor')
            .addSelect('vendedor.apellidos', 'apellido_vendedor')
            .addSelect('COUNT(factura.id)', 'cantidad_facturas')
            .addSelect('SUM(factura.total)', 'total_vendido')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .groupBy('vendedor.id')
            .addGroupBy('vendedor.nombres')
            .addGroupBy('vendedor.apellidos')
            .orderBy('total_vendido', 'DESC')
            .getRawMany();

        return resultados.map(r => ({
            vendedor: r.nombre_vendedor ? `${r.nombre_vendedor} ${r.apellido_vendedor || ''}`.trim() : 'Sin Asignar',
            cantidad: parseInt(r.cantidad_facturas),
            total: parseFloat(parseFloat(r.total_vendido || '0').toFixed(2))
        }));
    }

    async obtenerVentasPorLocal(periodo: string) {
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo(periodo);

        // Since Factura has punto_venta_id but maybe no direct relation in entity, 
        // we group by ID and then could map if we want, or join if we fixed entity.
        // But cleaner is to just select from Factura and Join PuntoVenta manually if needed
        // or just use the ID if we are lazy. But for Dashboard we need Names.

        // Let's try to join via ID manually by subquery or just map later.
        // Actually, let's query PuntosVenta and their sales.

        const resultados = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('factura.punto_venta_id', 'punto_venta_id')
            .addSelect('COUNT(factura.id)', 'cantidad_facturas')
            .addSelect('SUM(factura.total)', 'total_vendido')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .groupBy('factura.punto_venta_id')
            .getRawMany();

        // Get names for Puntos de Venta
        const puntosVenta = await this.puntoVentaRepository.find();

        return resultados.map(r => {
            const pv = puntosVenta.find(p => p.id === parseInt(r.punto_venta_id));
            return {
                local: pv ? pv.nombre : `Local ID ${r.punto_venta_id}`,
                cantidad: parseInt(r.cantidad_facturas),
                total: parseFloat(parseFloat(r.total_vendido || '0').toFixed(2))
            };
        }).sort((a, b) => b.total - a.total);
    }

    async obtenerResumenVentas(periodo: string) {
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo(periodo);

        const datos = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('COUNT(factura.id)', 'cantidad')
            .addSelect('SUM(factura.total)', 'total_ventas')
            .addSelect('AVG(factura.total)', 'ticket_promedio')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();

        return {
            totalVentas: parseFloat(datos?.total_ventas || '0'),
            cantidadFacturas: parseInt(datos?.cantidad || '0'),
            ticketPromedio: parseFloat(parseFloat(datos?.ticket_promedio || '0').toFixed(2))
        }
    }
}
