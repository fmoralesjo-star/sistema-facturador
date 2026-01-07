import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';
import { AsientoContable } from '../contabilidad/entities/asiento-contable.entity';
import { Promocion } from '../promociones/entities/promocion.entity';
import { Transferencia } from '../transferencias/entities/transferencia.entity';
import { Empleado } from '../recursos-humanos/entities/empleado.entity';

/**
 * Servicio centralizado para integración entre módulos
 * Proporciona métodos para obtener información consolidada
 */
@Injectable()
export class IntegracionService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(MovimientoInventario)
    private movimientoRepository: Repository<MovimientoInventario>,
    @InjectRepository(AsientoContable)
    private asientoRepository: Repository<AsientoContable>,
    @InjectRepository(Promocion)
    private promocionRepository: Repository<Promocion>,
    @InjectRepository(Transferencia)
    private transferenciaRepository: Repository<Transferencia>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
  ) {}

  /**
   * Obtiene estadísticas consolidadas de todos los módulos
   */
  async obtenerEstadisticasConsolidadas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyFin = new Date(hoy);
    hoyFin.setHours(23, 59, 59, 999);

    const [
      facturasHoy,
      productosTotal,
      productosBajoStock,
      movimientosHoy,
      promocionesActivas,
      transferenciasHoy,
      empleadosActivos,
    ] = await Promise.all([
      // Facturas del día
      this.facturaRepository
        .createQueryBuilder('factura')
        .where('factura.fecha >= :hoy', { hoy })
        .andWhere('factura.fecha <= :hoyFin', { hoyFin })
        .getMany(),

      // Total de productos
      this.productoRepository.count(),

      // Productos con stock bajo
      this.productoRepository
        .createQueryBuilder('producto')
        .where('producto.stock <= producto.punto_reorden')
        .getCount(),

      // Movimientos de inventario del día
      this.movimientoRepository
        .createQueryBuilder('movimiento')
        .where('movimiento.fecha >= :hoy', { hoy })
        .andWhere('movimiento.fecha <= :hoyFin', { hoyFin })
        .getCount(),

      // Promociones activas
      this.promocionRepository.count({
        where: { estado: 'activa' },
      }),

      // Transferencias del día
      this.transferenciaRepository
        .createQueryBuilder('transferencia')
        .where('transferencia.fecha >= :hoy', { hoy })
        .andWhere('transferencia.fecha <= :hoyFin', { hoyFin })
        .getCount(),

      // Empleados activos
      this.empleadoRepository.count({
        where: { activo: true },
      }),
    ]);

    const totalVentasHoy = facturasHoy.reduce((sum, f) => sum + (parseFloat(f.total?.toString() || '0') || 0), 0);

    return {
      facturacion: {
        facturas_hoy: facturasHoy.length,
        total_ventas_hoy: totalVentasHoy,
      },
      inventario: {
        productos_total: productosTotal,
        productos_bajo_stock: productosBajoStock,
        movimientos_hoy: movimientosHoy,
      },
      promociones: {
        activas: promocionesActivas,
      },
      transferencias: {
        hoy: transferenciasHoy,
      },
      recursos_humanos: {
        empleados_activos: empleadosActivos,
      },
    };
  }

  /**
   * Obtiene información de un producto con datos relacionados
   */
  async obtenerProductoIntegrado(productoId: number) {
    const producto = await this.productoRepository.findOne({
      where: { id: productoId },
    });

    if (!producto) {
      return null;
    }

    const [
      movimientos,
      facturas,
      promociones,
    ] = await Promise.all([
      // Últimos movimientos de inventario
      this.movimientoRepository.find({
        where: { producto_id: productoId },
        order: { fecha: 'DESC' },
        take: 10,
      }),

      // Facturas que incluyen este producto
      this.facturaRepository
        .createQueryBuilder('factura')
        .innerJoin('factura.detalles', 'detalle')
        .where('detalle.producto_id = :productoId', { productoId })
        .orderBy('factura.fecha', 'DESC')
        .take(10)
        .getMany(),

      // Promociones activas para este producto
      this.promocionRepository.find({
        where: [
          { producto_id: productoId, estado: 'activa' },
          { producto_id: null, estado: 'activa' },
        ],
      }),
    ]);

    return {
      producto,
      movimientos,
      facturas,
      promociones,
    };
  }

  /**
   * Obtiene información de una factura con datos relacionados
   */
  async obtenerFacturaIntegrada(facturaId: number) {
    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
      relations: ['detalles', 'detalles.producto'],
    });

    if (!factura) {
      return null;
    }

    const [
      movimientos,
      asientoContable,
    ] = await Promise.all([
      // Movimientos de inventario relacionados
      this.movimientoRepository.find({
        where: { factura_id: facturaId },
      }),

      // Asiento contable relacionado
      this.asientoRepository.findOne({
        where: { factura_id: facturaId },
        relations: ['partidas', 'partidas.cuenta'],
      }),
    ]);

    return {
      factura,
      movimientos,
      asientoContable,
    };
  }
}










