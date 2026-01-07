"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const compra_entity_1 = require("../compras/entities/compra.entity");
let KpisService = class KpisService {
    constructor(facturaRepository, productoRepository, compraRepository) {
        this.facturaRepository = facturaRepository;
        this.productoRepository = productoRepository;
        this.compraRepository = compraRepository;
    }
    obtenerFechasPeriodo(periodo) {
        const hoy = new Date();
        let fechaInicio;
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
    async calcularPuntoEquilibrio(periodo) {
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo(periodo);
        const ventas = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total_ventas')
            .addSelect('COUNT(factura.id)', 'cantidad_ventas')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();
        const compras = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total_compras')
            .where('compra.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .getRawOne();
        const totalVentas = parseFloat(ventas?.total_ventas || '0');
        const cantidadVentas = parseInt(ventas?.cantidad_ventas || '0');
        const totalCompras = parseFloat(compras?.total_compras || '0');
        const costosFijosMensuales = 5000;
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
    async calcularMargenesUtilidad(fechaInicioStr, fechaFinStr) {
        const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr) : this.obtenerFechasPeriodo('mes').fechaInicio;
        const fechaFin = fechaFinStr ? new Date(fechaFinStr) : this.obtenerFechasPeriodo('mes').fechaFin;
        const ventas = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.subtotal)', 'subtotal')
            .addSelect('SUM(factura.impuesto)', 'impuesto')
            .addSelect('SUM(factura.total)', 'total')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();
        const compras = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total_compras')
            .where('compra.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .getRawOne();
        const totalVentas = parseFloat(ventas?.total || '0');
        const totalCompras = parseFloat(compras?.total_compras || '0');
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
    async obtenerTopProductos(limite, periodo) {
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
    async calcularROI(fechaInicioStr, fechaFinStr) {
        const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr) : this.obtenerFechasPeriodo('mes').fechaInicio;
        const fechaFin = fechaFinStr ? new Date(fechaFinStr) : this.obtenerFechasPeriodo('mes').fechaFin;
        const ventas = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total')
            .where('factura.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();
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
    async calcularRotacionInventario(periodo) {
        const { fechaInicio, fechaFin } = this.obtenerFechasPeriodo(periodo);
        const compras = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total')
            .where('compra.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .getRawOne();
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
        const cuentasPorCobrar = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total')
            .where('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();
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
        const cuentasCobrar = await this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total')
            .where('factura.estado = :estado', { estado: 'AUTORIZADA' })
            .getRawOne();
        const inventario = await this.productoRepository
            .createQueryBuilder('producto')
            .select('SUM(producto.stock * producto.costo)', 'valor')
            .getRawOne();
        const cuentasPagar = await this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total')
            .where('compra.estado IS NULL OR compra.estado != :estado', { estado: 'PAGADA' })
            .getRawOne();
        const activosCorrientes = parseFloat(cuentasCobrar?.total || '0') +
            parseFloat(inventario?.valor || '0') +
            10000;
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
    async obtenerResumenCompleto(periodo) {
        const [puntoEquilibrio, margenes, topProductos, roi, rotacion, diasCobrar, ratioCorriente] = await Promise.all([
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
};
exports.KpisService = KpisService;
exports.KpisService = KpisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(2, (0, typeorm_1.InjectRepository)(compra_entity_1.Compra)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], KpisService);
//# sourceMappingURL=kpis.service.js.map