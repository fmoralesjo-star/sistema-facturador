import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';
import { Empleado } from '../recursos-humanos/entities/empleado.entity';
import { Promocion } from '../promociones/entities/promocion.entity';
import { CuentaContable } from '../contabilidad/entities/cuenta-contable.entity';
import { PartidaContable } from '../contabilidad/entities/partida-contable.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    @InjectRepository(Compra)
    private compraRepository: Repository<Compra>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(MovimientoInventario)
    private movimientoRepository: Repository<MovimientoInventario>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    @InjectRepository(Promocion)
    private promocionRepository: Repository<Promocion>,
    @InjectRepository(CuentaContable)
    private cuentaRepository: Repository<CuentaContable>,
    @InjectRepository(PartidaContable)
    private partidaRepository: Repository<PartidaContable>,
  ) { }

  // --- REPORTES FINANCIEROS (NIIF) ---

  async generarBalanceGeneral(fechaCorte: Date) {
    // 1. Obtener cuentas de Activo (1), Pasivo (2) y Patrimonio (3)
    const cuentas = await this.cuentaRepository.find({
      where: { activa: true },
      order: { codigo: 'ASC' }
    });

    // 2. Calcular saldos a la fecha de corte
    const saldos = await this.partidaRepository.createQueryBuilder('partida')
      .innerJoin('partida.asiento', 'asiento')
      .select('partida.cuenta_id', 'cuenta_id')
      .addSelect('SUM(partida.debe)', 'total_debe')
      .addSelect('SUM(partida.haber)', 'total_haber')
      .where('asiento.fecha <= :fechaCorte', { fechaCorte })
      .groupBy('partida.cuenta_id')
      .getRawMany();

    const mapSaldos = new Map<number, number>();
    saldos.forEach(s => {
      mapSaldos.set(s.cuenta_id, Number(s.total_debe) - Number(s.total_haber));
    });

    // 3. Construir árbol
    const arbol = this.construirArbolCuentas(cuentas, mapSaldos, ['1', '2', '3']);

    // 4. Calcular totales
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

  async generarEstadoResultados(fechaInicio: Date, fechaFin: Date) {
    // 1. Obtener cuentas de Ingresos (4), Gastos (5), Costos (6)
    const cuentas = await this.cuentaRepository.find({
      where: { activa: true },
      order: { codigo: 'ASC' }
    });

    // 2. Calcular movimientos del periodo
    const movimientos = await this.partidaRepository.createQueryBuilder('partida')
      .innerJoin('partida.asiento', 'asiento')
      .select('partida.cuenta_id', 'cuenta_id')
      .addSelect('SUM(partida.debe)', 'total_debe')
      .addSelect('SUM(partida.haber)', 'total_haber')
      .where('asiento.fecha >= :fechaInicio', { fechaInicio })
      .andWhere('asiento.fecha <= :fechaFin', { fechaFin })
      .groupBy('partida.cuenta_id')
      .getRawMany();

    const mapSaldos = new Map<number, number>();
    movimientos.forEach(s => {
      // En Estado de Resultados, interesan los ACREEDORES (Ingresos) como positivos y DEUDORES (Gastos) como negativos para la utilidad?
      // Estandar: Ingresos (Haber > Debe), Gastos (Debe > Haber).
      // Saldo = Haber - Debe (para que ingresos sean + y gastos -)?
      // O Saldo = Debe - Haber y luego invertimos segun naturaleza. Usaremos la misma logica: Debe - Haber.
      mapSaldos.set(s.cuenta_id, Number(s.total_debe) - Number(s.total_haber));
    });

    // 3. Construir árbol para grupos 4, 5, 6
    const arbol = this.construirArbolCuentas(cuentas, mapSaldos, ['4', '5', '6']);

    // 4. Calcular utilidad
    const totalIngresos = Math.abs(this.obtenerSaldoGrupo(arbol, '4')); // Ingresos son Acreedores (saldo negativo en Debe-Haber) -> Abs para mostrar positivo
    const totalGastos = this.obtenerSaldoGrupo(arbol, '5'); // Gastos son Deudores (saldo positivo)
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

  // Helper para construir árbol recursivo
  private construirArbolCuentas(cuentasAll: CuentaContable[], saldos: Map<number, number>, grupos: string[]) {
    const cuentasFiltradas = cuentasAll.filter(c => grupos.some(g => c.codigo.startsWith(g)));

    const mapaNodos = new Map<number, any>();
    const raiz: any[] = [];

    // 1. Crear nodos
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

    // 2. Asignar saldos base (solo cuentas de movimiento)
    saldos.forEach((valor, id) => {
      if (mapaNodos.has(id)) {
        mapaNodos.get(id).saldo = valor;
      }
    });

    // 3. Armar jerarquía y acumular saldos hacia arriba
    // Es importante procesar de abajo hacia arriba para sumar saldos, pero como no sabemos el orden de nivel,
    // usaremos recursividad al momento de consultar o un post-procesamiento.
    // Mejor: armar la estructura y luego sumar recursivamente.

    cuentasFiltradas.forEach(c => {
      const nodo = mapaNodos.get(c.id);
      if (c.padre_id && mapaNodos.has(c.padre_id)) {
        mapaNodos.get(c.padre_id).hijos.push(nodo);
      } else {
        raiz.push(nodo);
      }
    });

    // 4. Calcular saldos acumulados recursivamente
    this.calcularSaldosRecursivo(raiz);

    return raiz;
  }

  private calcularSaldosRecursivo(nodos: any[]) {
    nodos.forEach(nodo => {
      if (nodo.hijos.length > 0) {
        this.calcularSaldosRecursivo(nodo.hijos);
        // Sumar saldos de hijos
        const sumaHijos = nodo.hijos.reduce((acc, h) => acc + h.saldo, 0);
        nodo.saldo += sumaHijos;
      }
      // Aplicar naturaleza para la visualización final si es necesario, 
      // pero para agregación matemática es mejor mantener signo (Debe - Haber).
    });
  }

  private obtenerSaldoGrupo(arbol: any[], grupo: string): number {
    const nodo = arbol.find(n => n.codigo.startsWith(grupo));
    // Buscar en el array raiz
    // Depende de si 'arbol' tiene los nodos raiz 1, 2, 3...
    const nodoGrupo = arbol.find(c => c.codigo.startsWith(grupo) && c.codigo.length === 1); // e.g. codigo "1"
    return nodoGrupo ? nodoGrupo.saldo : 0;
  }

  /**
   * Reporte consolidado de ventas por vendedor
   */
  async reporteVentasPorVendedor(fechaInicio?: Date, fechaFin?: Date) {
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

  /**
   * Reporte de productos más vendidos
   */
  async reporteProductosMasVendidos(fechaInicio?: Date, fechaFin?: Date, limite: number = 10) {
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

  /**
   * Reporte de rotación de inventario
   */
  async reporteRotacionInventario() {
    const productos = await this.productoRepository.find();

    const reporte = await Promise.all(
      productos.map(async (producto) => {
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
      }),
    );

    return reporte.sort((a, b) => parseFloat(b.rotacion) - parseFloat(a.rotacion));
  }

  /**
   * Reporte de efectividad de promociones
   */
  async reporteEfectividadPromociones(fechaInicio?: Date, fechaFin?: Date) {
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
      const facturas = facturasConPromocion.filter(
        f => f.detalles?.some(d => d.promocion_id === promocion.id),
      );
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

  /**
   * Reporte consolidado de compras vs ventas
   */
  async reporteComprasVsVentas(fechaInicio?: Date, fechaFin?: Date) {
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

  async generarLibroDiario(fechaInicio: Date, fechaFin: Date) {
    return this.partidaRepository.manager.createQueryBuilder('asiento_contable', 'asiento')
      .leftJoinAndSelect('asiento.partidas', 'partida')
      .leftJoinAndSelect('partida.cuenta', 'cuenta')
      .where('asiento.fecha >= :fechaInicio', { fechaInicio })
      .andWhere('asiento.fecha <= :fechaFin', { fechaFin })
      .orderBy('asiento.fecha', 'ASC')
      .addOrderBy('asiento.id', 'ASC')
      .getMany();
  }

  async generarLibroMayor(fechaInicio: Date, fechaFin: Date, cuentaId?: number) {
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

    // Agrupar por cuenta
    const mayor: any[] = [];
    const movimientosPorCuenta = new Map<string, any[]>();

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

  async generarFlujoCaja(fechaInicio: Date, fechaFin: Date) {
    // 1. FLUJO CONTABLE (Devengado)
    // Suma de Ventas - Suma de Costos/Gastos (independiente de si se cobró)
    const estadoResultados = await this.generarEstadoResultados(fechaInicio, fechaFin);
    const flujoContableIngresos = estadoResultados.resumen.total_ingresos;
    const flujoContableEgresos = estadoResultados.resumen.total_gastos + estadoResultados.resumen.total_costos;
    const utilidadContable = estadoResultados.resumen.utilidad_ejercicio;

    // 2. FLUJO REAL (Percibido/Pagado)
    // Movimientos en cuentas del Grupo 1.1 (Disponible)
    // Debe = Entradas (Cobros), Haber = Salidas (Pagos)

    const movimientosEfectivo = await this.partidaRepository.createQueryBuilder('partida')
      .innerJoinAndSelect('partida.cuenta', 'cuenta')
      .innerJoinAndSelect('partida.asiento', 'asiento')
      .where('asiento.fecha >= :fechaInicio', { fechaInicio })
      .andWhere('asiento.fecha <= :fechaFin', { fechaFin })
      .andWhere('cuenta.codigo LIKE :codigo', { codigo: '1.1%' }) // Grupo Disponible
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
      diferencia_ingresos: flujoContableIngresos - entradasReales, // Cuentas por cobrar potenciales
      diferencia_egresos: flujoContableEgresos - salidasReales     // Cuentas por pagar potenciales
    };
  }
}












