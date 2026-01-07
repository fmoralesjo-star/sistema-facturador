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
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const compra_entity_1 = require("../compras/entities/compra.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const movimiento_inventario_entity_1 = require("../inventario/entities/movimiento-inventario.entity");
const empleado_entity_1 = require("../recursos-humanos/entities/empleado.entity");
const promocion_entity_1 = require("../promociones/entities/promocion.entity");
const cuenta_contable_entity_1 = require("../contabilidad/entities/cuenta-contable.entity");
const partida_contable_entity_1 = require("../contabilidad/entities/partida-contable.entity");
let ReportesService = class ReportesService {
    constructor(facturaRepository, compraRepository, productoRepository, movimientoRepository, empleadoRepository, promocionRepository, cuentaRepository, partidaRepository) {
        this.facturaRepository = facturaRepository;
        this.compraRepository = compraRepository;
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
        this.empleadoRepository = empleadoRepository;
        this.promocionRepository = promocionRepository;
        this.cuentaRepository = cuentaRepository;
        this.partidaRepository = partidaRepository;
    }
    async generarBalanceGeneral(fechaCorte) {
        const cuentas = await this.cuentaRepository.find({
            where: { activa: true },
            order: { codigo: 'ASC' }
        });
        const saldos = await this.partidaRepository.createQueryBuilder('partida')
            .innerJoin('partida.asiento', 'asiento')
            .select('partida.cuenta_id', 'cuenta_id')
            .addSelect('SUM(partida.debe)', 'total_debe')
            .addSelect('SUM(partida.haber)', 'total_haber')
            .where('asiento.fecha <= :fechaCorte', { fechaCorte })
            .groupBy('partida.cuenta_id')
            .getRawMany();
        const mapSaldos = new Map();
        saldos.forEach(s => {
            mapSaldos.set(s.cuenta_id, Number(s.total_debe) - Number(s.total_haber));
        });
        const arbol = this.construirArbolCuentas(cuentas, mapSaldos, ['1', '2', '3']);
        const totalActivo = this.obtenerSaldoGrupo(arbol, '1');
        const totalPasivo = this.obtenerSaldoGrupo(arbol, '2');
        const totalPatrimonio = this.obtenerSaldoGrupo(arbol, '3');
        return {
            fechaCorte,
            activos: arbol.filter(c => c.codigo.startsWith('1')),
            pasivos: arbol.filter(c => c.codigo.startsWith('2')),
            patrimonio: arbol.filter(c => c.codigo.startsWith('3')),
            resumen: {
                total_activos: totalActivo,
                total_pasivos: totalPasivo,
                total_patrimonio: totalPatrimonio,
                ecuacion_contable: (totalActivo - (totalPasivo + totalPatrimonio)).toFixed(2)
            }
        };
    }
    async generarEstadoResultados(fechaInicio, fechaFin) {
        const cuentas = await this.cuentaRepository.find({
            where: { activa: true },
            order: { codigo: 'ASC' }
        });
        const movimientos = await this.partidaRepository.createQueryBuilder('partida')
            .innerJoin('partida.asiento', 'asiento')
            .select('partida.cuenta_id', 'cuenta_id')
            .addSelect('SUM(partida.debe)', 'total_debe')
            .addSelect('SUM(partida.haber)', 'total_haber')
            .where('asiento.fecha >= :fechaInicio', { fechaInicio })
            .andWhere('asiento.fecha <= :fechaFin', { fechaFin })
            .groupBy('partida.cuenta_id')
            .getRawMany();
        const mapSaldos = new Map();
        movimientos.forEach(s => {
            mapSaldos.set(s.cuenta_id, Number(s.total_debe) - Number(s.total_haber));
        });
        const arbol = this.construirArbolCuentas(cuentas, mapSaldos, ['4', '5', '6']);
        const totalIngresos = Math.abs(this.obtenerSaldoGrupo(arbol, '4'));
        const totalGastos = this.obtenerSaldoGrupo(arbol, '5');
        const totalCostos = this.obtenerSaldoGrupo(arbol, '6');
        return {
            fechaInicio,
            fechaFin,
            ingresos: arbol.filter(c => c.codigo.startsWith('4')),
            gastos: arbol.filter(c => c.codigo.startsWith('5')),
            costos: arbol.filter(c => c.codigo.startsWith('6')),
            resumen: {
                total_ingresos: totalIngresos,
                total_gastos: totalGastos,
                total_costos: totalCostos,
                utilidad_bruta: totalIngresos - totalCostos,
                utilidad_ejercicio: totalIngresos - totalGastos - totalCostos
            }
        };
    }
    construirArbolCuentas(cuentasAll, saldos, grupos) {
        const cuentasFiltradas = cuentasAll.filter(c => grupos.some(g => c.codigo.startsWith(g)));
        const mapaNodos = new Map();
        const raiz = [];
        cuentasFiltradas.forEach(c => {
            mapaNodos.set(c.id, {
                id: c.id,
                codigo: c.codigo,
                nombre: c.nombre,
                padre_id: c.padre_id,
                naturaleza: c.naturaleza,
                saldo: 0,
                hijos: []
            });
        });
        saldos.forEach((valor, id) => {
            if (mapaNodos.has(id)) {
                mapaNodos.get(id).saldo = valor;
            }
        });
        cuentasFiltradas.forEach(c => {
            const nodo = mapaNodos.get(c.id);
            if (c.padre_id && mapaNodos.has(c.padre_id)) {
                mapaNodos.get(c.padre_id).hijos.push(nodo);
            }
            else {
                raiz.push(nodo);
            }
        });
        this.calcularSaldosRecursivo(raiz);
        return raiz;
    }
    calcularSaldosRecursivo(nodos) {
        nodos.forEach(nodo => {
            if (nodo.hijos.length > 0) {
                this.calcularSaldosRecursivo(nodo.hijos);
                const sumaHijos = nodo.hijos.reduce((acc, h) => acc + h.saldo, 0);
                nodo.saldo += sumaHijos;
            }
        });
    }
    obtenerSaldoGrupo(arbol, grupo) {
        const nodo = arbol.find(n => n.codigo.startsWith(grupo));
        const nodoGrupo = arbol.find(c => c.codigo.startsWith(grupo) && c.codigo.length === 1);
        return nodoGrupo ? nodoGrupo.saldo : 0;
    }
    async reporteVentasPorVendedor(fechaInicio, fechaFin) {
        let query = this.facturaRepository
            .createQueryBuilder('factura')
            .leftJoinAndSelect('factura.vendedor', 'vendedor')
            .select('vendedor.id', 'vendedor_id')
            .addSelect('vendedor.nombre', 'vendedor_nombre')
            .addSelect('vendedor.apellido', 'vendedor_apellido')
            .addSelect('COUNT(factura.id)', 'total_facturas')
            .addSelect('SUM(factura.total)', 'total_ventas')
            .addSelect('AVG(factura.total)', 'promedio_venta')
            .where('factura.estado != :estado', { estado: 'CANCELADA' })
            .groupBy('vendedor.id')
            .addGroupBy('vendedor.nombre')
            .addGroupBy('vendedor.apellido');
        if (fechaInicio && fechaFin) {
            query = query
                .andWhere('factura.fecha >= :fechaInicio', { fechaInicio })
                .andWhere('factura.fecha <= :fechaFin', { fechaFin });
        }
        return query.getRawMany();
    }
    async reporteProductosMasVendidos(fechaInicio, fechaFin, limite = 10) {
        let query = this.facturaRepository
            .createQueryBuilder('factura')
            .innerJoin('factura.detalles', 'detalle')
            .innerJoin('detalle.producto', 'producto')
            .select('producto.id', 'producto_id')
            .addSelect('producto.nombre', 'producto_nombre')
            .addSelect('producto.codigo', 'producto_codigo')
            .addSelect('SUM(detalle.cantidad)', 'total_vendido')
            .addSelect('SUM(detalle.subtotal)', 'total_ingresos')
            .where('factura.estado != :estado', { estado: 'CANCELADA' })
            .groupBy('producto.id')
            .addGroupBy('producto.nombre')
            .addGroupBy('producto.codigo')
            .orderBy('total_vendido', 'DESC')
            .limit(limite);
        if (fechaInicio && fechaFin) {
            query = query
                .andWhere('factura.fecha >= :fechaInicio', { fechaInicio })
                .andWhere('factura.fecha <= :fechaFin', { fechaFin });
        }
        return query.getRawMany();
    }
    async reporteRotacionInventario() {
        const productos = await this.productoRepository.find();
        const reporte = await Promise.all(productos.map(async (producto) => {
            const movimientos = await this.movimientoRepository.find({
                where: { producto_id: producto.id },
                order: { fecha: 'DESC' },
            });
            const entradas = movimientos
                .filter(m => m.tipo === 'ENTRADA')
                .reduce((sum, m) => sum + m.cantidad, 0);
            const salidas = movimientos
                .filter(m => m.tipo === 'SALIDA')
                .reduce((sum, m) => sum + m.cantidad, 0);
            const rotacion = producto.stock > 0 ? salidas / producto.stock : 0;
            return {
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                producto_codigo: producto.codigo,
                stock_actual: producto.stock,
                total_entradas: entradas,
                total_salidas: salidas,
                rotacion: rotacion.toFixed(2),
            };
        }));
        return reporte.sort((a, b) => parseFloat(b.rotacion) - parseFloat(a.rotacion));
    }
    async reporteEfectividadPromociones(fechaInicio, fechaFin) {
        const promociones = await this.promocionRepository.find({
            where: { estado: 'activa' },
        });
        let query = this.facturaRepository
            .createQueryBuilder('factura')
            .innerJoin('factura.detalles', 'detalle')
            .where('detalle.promocion_id IS NOT NULL');
        if (fechaInicio && fechaFin) {
            query = query
                .andWhere('factura.fecha >= :fechaInicio', { fechaInicio })
                .andWhere('factura.fecha <= :fechaFin', { fechaFin });
        }
        const facturasConPromocion = await query.getMany();
        return promociones.map((promocion) => {
            const facturas = facturasConPromocion.filter(f => f.detalles?.some(d => d.promocion_id === promocion.id));
            const totalDescuento = facturas.reduce((sum, f) => {
                const descuento = f.detalles
                    ?.filter(d => d.promocion_id === promocion.id)
                    .reduce((s, d) => s + (d.descuento || 0), 0) || 0;
                return sum + descuento;
            }, 0);
            return {
                promocion_id: promocion.id,
                promocion_nombre: promocion.nombre,
                total_usos: promocion.usos_actuales || 0,
                facturas_aplicadas: facturas.length,
                total_descuento: totalDescuento,
                efectividad: promocion.maximo_usos
                    ? ((promocion.usos_actuales || 0) / promocion.maximo_usos) * 100
                    : null,
            };
        });
    }
    async reporteComprasVsVentas(fechaInicio, fechaFin) {
        let queryCompras = this.compraRepository
            .createQueryBuilder('compra')
            .select('SUM(compra.total)', 'total_compras')
            .addSelect('COUNT(compra.id)', 'cantidad_compras');
        let queryVentas = this.facturaRepository
            .createQueryBuilder('factura')
            .select('SUM(factura.total)', 'total_ventas')
            .addSelect('COUNT(factura.id)', 'cantidad_facturas')
            .where('factura.estado != :estado', { estado: 'CANCELADA' });
        if (fechaInicio && fechaFin) {
            queryCompras = queryCompras
                .where('compra.fecha >= :fechaInicio', { fechaInicio })
                .andWhere('compra.fecha <= :fechaFin', { fechaFin });
            queryVentas = queryVentas
                .andWhere('factura.fecha >= :fechaInicio', { fechaInicio })
                .andWhere('factura.fecha <= :fechaFin', { fechaFin });
        }
        const [compras, ventas] = await Promise.all([
            queryCompras.getRawOne(),
            queryVentas.getRawOne(),
        ]);
        const totalCompras = parseFloat(compras.total_compras || '0');
        const totalVentas = parseFloat(ventas.total_ventas || '0');
        const utilidad = totalVentas - totalCompras;
        const margen = totalVentas > 0 ? (utilidad / totalVentas) * 100 : 0;
        return {
            compras: {
                total: totalCompras,
                cantidad: parseInt(compras.cantidad_compras || '0'),
            },
            ventas: {
                total: totalVentas,
                cantidad: parseInt(ventas.cantidad_facturas || '0'),
            },
            utilidad,
            margen: margen.toFixed(2),
        };
    }
    async generarLibroDiario(fechaInicio, fechaFin) {
        return this.partidaRepository.manager.createQueryBuilder('asiento_contable', 'asiento')
            .leftJoinAndSelect('asiento.partidas', 'partida')
            .leftJoinAndSelect('partida.cuenta', 'cuenta')
            .where('asiento.fecha >= :fechaInicio', { fechaInicio })
            .andWhere('asiento.fecha <= :fechaFin', { fechaFin })
            .orderBy('asiento.fecha', 'ASC')
            .addOrderBy('asiento.id', 'ASC')
            .getMany();
    }
    async generarLibroMayor(fechaInicio, fechaFin, cuentaId) {
        let query = this.partidaRepository.createQueryBuilder('partida')
            .innerJoinAndSelect('partida.asiento', 'asiento')
            .innerJoinAndSelect('partida.cuenta', 'cuenta')
            .where('asiento.fecha >= :fechaInicio', { fechaInicio })
            .andWhere('asiento.fecha <= :fechaFin', { fechaFin });
        if (cuentaId) {
            query = query.andWhere('partida.cuenta_id = :cuentaId', { cuentaId });
        }
        query = query.orderBy('partida.cuenta_id', 'ASC')
            .addOrderBy('asiento.fecha', 'ASC');
        const movimientos = await query.getMany();
        const mayor = [];
        const movimientosPorCuenta = new Map();
        movimientos.forEach(m => {
            const key = m.cuenta.codigo;
            if (!movimientosPorCuenta.has(key)) {
                movimientosPorCuenta.set(key, []);
            }
            movimientosPorCuenta.get(key).push(m);
        });
        movimientosPorCuenta.forEach((movs, codigo) => {
            const cuenta = movs[0].cuenta;
            let saldo = 0;
            const detalle = movs.map(m => {
                const movimientoNeto = Number(m.debe) - Number(m.haber);
                saldo += movimientoNeto;
                return {
                    fecha: m.asiento.fecha,
                    asiento: m.asiento.numero_asiento,
                    descripcion: m.descripcion || m.asiento.descripcion,
                    debe: m.debe,
                    haber: m.haber,
                    saldo_parcial: saldo
                };
            });
            mayor.push({
                cuenta_id: cuenta.id,
                codigo: cuenta.codigo,
                nombre: cuenta.nombre,
                naturaleza: cuenta.naturaleza,
                movimientos: detalle,
                saldo_final: saldo
            });
        });
        return mayor;
    }
    async generarFlujoCaja(fechaInicio, fechaFin) {
        const estadoResultados = await this.generarEstadoResultados(fechaInicio, fechaFin);
        const flujoContableIngresos = estadoResultados.resumen.total_ingresos;
        const flujoContableEgresos = estadoResultados.resumen.total_gastos + estadoResultados.resumen.total_costos;
        const utilidadContable = estadoResultados.resumen.utilidad_ejercicio;
        const movimientosEfectivo = await this.partidaRepository.createQueryBuilder('partida')
            .innerJoinAndSelect('partida.cuenta', 'cuenta')
            .innerJoinAndSelect('partida.asiento', 'asiento')
            .where('asiento.fecha >= :fechaInicio', { fechaInicio })
            .andWhere('asiento.fecha <= :fechaFin', { fechaFin })
            .andWhere('cuenta.codigo LIKE :codigo', { codigo: '1.1%' })
            .getMany();
        const entradasReales = movimientosEfectivo.reduce((sum, m) => sum + Number(m.debe), 0);
        const salidasReales = movimientosEfectivo.reduce((sum, m) => sum + Number(m.haber), 0);
        const flujoNetoReal = entradasReales - salidasReales;
        return {
            fechaInicio,
            fechaFin,
            contable: {
                ingresos_devengados: flujoContableIngresos,
                egresos_devengados: flujoContableEgresos,
                utilidad_contable: utilidadContable
            },
            real: {
                entradas_efectivo: entradasReales,
                salidas_efectivo: salidasReales,
                flujo_neto: flujoNetoReal
            },
            diferencia_ingresos: flujoContableIngresos - entradasReales,
            diferencia_egresos: flujoContableEgresos - salidasReales
        };
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, typeorm_1.InjectRepository)(compra_entity_1.Compra)),
    __param(2, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(3, (0, typeorm_1.InjectRepository)(movimiento_inventario_entity_1.MovimientoInventario)),
    __param(4, (0, typeorm_1.InjectRepository)(empleado_entity_1.Empleado)),
    __param(5, (0, typeorm_1.InjectRepository)(promocion_entity_1.Promocion)),
    __param(6, (0, typeorm_1.InjectRepository)(cuenta_contable_entity_1.CuentaContable)),
    __param(7, (0, typeorm_1.InjectRepository)(partida_contable_entity_1.PartidaContable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportesService);
//# sourceMappingURL=reportes.service.js.map