import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { Producto } from '../productos/entities/producto.entity';
import { ProductoUbicacion } from './entities/producto-ubicacion.entity';
import { ProductoPuntoVenta } from './entities/producto-punto-venta.entity';
import { AlertasInventarioService } from './alertas-inventario.service';
import { ValoracionInventarioService } from './valoracion-inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { EventsGateway } from '../../gateways/events.gateway';

export interface CreateMovimientoDto {
  producto_id: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo?: string;
  observaciones?: string;
  factura_id?: number;
  compra_id?: number;
  fecha?: Date | string;
  punto_venta_id?: number; // ID del punto de venta (opcional)
}

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private movimientoRepository: Repository<MovimientoInventario>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(ProductoUbicacion)
    private productoUbicacionRepository: Repository<ProductoUbicacion>,
    @InjectRepository(ProductoPuntoVenta)
    private productoPuntoVentaRepository: Repository<ProductoPuntoVenta>,
    @Inject(forwardRef(() => AlertasInventarioService))
    private alertasService: AlertasInventarioService,
    @Inject(forwardRef(() => ValoracionInventarioService))
    private valoracionService: ValoracionInventarioService,
    @Inject(forwardRef(() => ContabilidadService))
    private contabilidadService: ContabilidadService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway?: EventsGateway,
  ) { }

  async registrarMovimiento(
    dto: CreateMovimientoDto,
    queryRunner?: QueryRunner,
  ): Promise<MovimientoInventario> {
    const movimiento = this.movimientoRepository.create({
      producto_id: dto.producto_id,
      tipo: dto.tipo,
      cantidad: dto.cantidad,
      motivo: dto.motivo,
      observaciones: dto.observaciones,
      factura_id: dto.factura_id,
      compra_id: dto.compra_id,
      punto_venta_id: dto.punto_venta_id,
      fecha: dto.fecha ? (typeof dto.fecha === 'string' ? new Date(dto.fecha) : dto.fecha) : new Date(),
    });

    if (queryRunner) {
      return queryRunner.manager.save(movimiento);
    }

    return this.movimientoRepository.save(movimiento);
  }

  async registrarMovimientoConActualizacion(
    dto: CreateMovimientoDto,
    queryRunner?: QueryRunner,
  ): Promise<MovimientoInventario> {
    // Obtener producto y stock actual
    let producto: Producto;

    if (queryRunner) {
      producto = await queryRunner.manager.findOne(Producto, { where: { id: dto.producto_id } });
    } else {
      producto = await this.productoRepository.findOne({ where: { id: dto.producto_id } });
    }

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    const stockAnterior = producto.stock || 0;
    let nuevoStock = stockAnterior;

    // Calcular nuevo stock según tipo de movimiento
    if (dto.tipo === 'ENTRADA') {
      nuevoStock = stockAnterior + dto.cantidad;
    } else if (dto.tipo === 'SALIDA') {
      nuevoStock = Math.max(0, stockAnterior - dto.cantidad);
    } else if (dto.tipo === 'AJUSTE') {
      nuevoStock = dto.cantidad;
    }

    // Registrar movimiento
    const movimiento = await this.registrarMovimiento({
      ...dto,
      fecha: dto.fecha || new Date(),
    }, queryRunner);

    // Actualizar stock del producto
    if (queryRunner) {
      await queryRunner.manager.update(Producto, { id: dto.producto_id }, { stock: nuevoStock });
    } else {
      await this.productoRepository.update({ id: dto.producto_id }, { stock: nuevoStock });
    }

    // Generar asiento contable para ajustes manuales (no facturas ni compras)
    // NOTA: Si estamos en una transacción externa (queryRunner), NO deberíamos crear transacciones anidadas implícitas
    // o deberíamos pasar el queryRunner al servicio contable si soportara.
    // Por ahora, mantenemos la lógica pero advertimos que esto podría quedar fuera de la Tx principal si ContabilidadService no usa el runner.
    // TODO: Refactorizar ContabilidadService para aceptar QueryRunner
    if (dto.tipo === 'AJUSTE' || (!dto.factura_id && !dto.compra_id)) {
      try {
        await this.contabilidadService.crearAsientoAjusteInventario({
          producto: producto,
          cantidad: dto.tipo === 'AJUSTE' ? (nuevoStock - stockAnterior) : (dto.tipo === 'ENTRADA' ? dto.cantidad : -dto.cantidad),
          tipo: dto.tipo,
          motivo: dto.motivo || 'Ajuste manual de inventario',
          valorUnitario: Number(producto.precio) || 0,
        });
      } catch (error) {
        console.error('Error al crear asiento contable para ajuste de inventario:', error);
      }
    }

    // Notificar si el stock está bajo (Eventos pueden ir fuera de la Tx o después del commit, pero aquí los emitimos igual)
    if (nuevoStock <= (producto.punto_reorden || 0) && this.eventsGateway) {
      this.eventsGateway.emitStockBajo({
        id: producto.id,
        nombre: producto.nombre,
        stock: nuevoStock,
        punto_reorden: producto.punto_reorden,
      });
    }

    // Retornar movimiento con información adicional
    return {
      ...movimiento,
      stock_anterior: stockAnterior,
      stock_nuevo: nuevoStock,
    } as any;
  }

  async obtenerKardex(productoId: number, puntoVentaId?: number) {
    const producto = await this.productoRepository.findOne({
      where: { id: productoId },
    });

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    // Construir condiciones de búsqueda
    const whereConditions: any = { producto_id: productoId };
    if (puntoVentaId) {
      whereConditions.punto_venta_id = puntoVentaId;
    }

    const movimientos = await this.movimientoRepository.find({
      where: whereConditions,
      order: { fecha: 'ASC', id: 'ASC' },
      relations: ['factura', 'puntoVenta'],
    });

    let stockActual = producto.stock;
    const movimientosConStock = movimientos.map((mov) => {
      if (mov.tipo === 'ENTRADA') {
        stockActual += mov.cantidad;
      } else if (mov.tipo === 'SALIDA') {
        stockActual -= mov.cantidad;
      } else if (mov.tipo === 'AJUSTE') {
        stockActual = mov.cantidad;
      }

      return {
        ...mov,
        stock_despues: stockActual,
        bodega: mov.puntoVenta ? {
          id: mov.puntoVenta.id,
          nombre: mov.puntoVenta.nombre,
          codigo: mov.puntoVenta.codigo
        } : null
      };
    });

    return {
      producto,
      stock_inicial: producto.stock,
      stock_actual: stockActual,
      movimientos: movimientosConStock,
      total_entradas: movimientos
        .filter((m) => m.tipo === 'ENTRADA')
        .reduce((sum, m) => sum + m.cantidad, 0),
      total_salidas: movimientos
        .filter((m) => m.tipo === 'SALIDA')
        .reduce((sum, m) => sum + m.cantidad, 0),
    };
  }

  async obtenerInventario() {
    const productos = await this.productoRepository.find({
      order: { nombre: 'ASC' },
    });

    // Obtener stocks por ubicación para cada producto
    const productosConUbicaciones = await Promise.all(
      productos.map(async (producto) => {
        const stocksUbicaciones = await this.productoUbicacionRepository.find({
          where: { producto_id: producto.id },
          relations: ['ubicacion'],
        });

        const ubicaciones = stocksUbicaciones.map((pu) => ({
          ubicacion_id: pu.ubicacion_id,
          ubicacion_nombre: pu.ubicacion.nombre,
          ubicacion_codigo: pu.ubicacion.codigo,
          ubicacion_tipo: pu.ubicacion.tipo,
          stock: pu.stock,
          estado_stock: pu.estado_stock,
        }));

        // Obtener stocks por punto de venta
        const stocksPuntosVenta = await this.productoPuntoVentaRepository.find({
          where: { producto_id: producto.id },
          relations: ['punto_venta'],
        });

        const desglose_stock = stocksPuntosVenta.map((ppv) => ({
          punto_venta_id: ppv.punto_venta_id,
          nombre: ppv.puntoVenta.nombre,
          codigo: ppv.puntoVenta.codigo,
          stock: ppv.stock,
        }));

        return {
          id: producto.id,
          codigo: producto.codigo,
          sku: producto.sku,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          stock_actual: producto.stock,
          activo: producto.activo,
          punto_reorden: producto.punto_reorden,
          stock_seguridad: producto.stock_seguridad,
          tiempo_entrega_dias: producto.tiempo_entrega_dias,
          costo_promedio: producto.costo_promedio,
          ubicaciones: ubicaciones,
          desglose_stock: desglose_stock, // Nuevo campo
          total_ubicaciones: ubicaciones.length,
        };
      }),
    );

    return productosConUbicaciones;
  }

  async obtenerMovimientos() {
    const movimientos = await this.movimientoRepository.find({
      relations: ['producto', 'factura'],
      order: { fecha: 'DESC', id: 'DESC' },
      take: 100, // Limitar a los últimos 100 movimientos
    });

    return movimientos.map((mov) => {
      // Calcular stock anterior y nuevo basado en el tipo de movimiento
      let stockAnterior = 0;
      let stockNuevo = 0;

      if (mov.producto) {
        // Para calcular stock anterior, necesitamos ver movimientos anteriores
        // Por simplicidad, usamos el stock actual y calculamos hacia atrás
        const stockActual = mov.producto.stock || 0;
        if (mov.tipo === 'ENTRADA') {
          stockNuevo = stockActual;
          stockAnterior = stockActual - mov.cantidad;
        } else if (mov.tipo === 'SALIDA') {
          stockNuevo = stockActual;
          stockAnterior = stockActual + mov.cantidad;
        } else if (mov.tipo === 'AJUSTE') {
          stockNuevo = mov.cantidad;
          stockAnterior = stockActual; // Aproximación
        }
      }

      return {
        id: mov.id,
        fecha: mov.fecha,
        tipo: mov.tipo,
        cantidad: mov.cantidad,
        motivo: mov.motivo || mov.observaciones,
        observaciones: mov.observaciones,
        producto_id: mov.producto_id,
        producto: {
          id: mov.producto?.id,
          nombre: mov.producto?.nombre,
          codigo: mov.producto?.codigo,
          sku: mov.producto?.sku,
        },
        producto_nombre: mov.producto?.nombre || 'N/A',
        codigo: mov.producto?.codigo || 'N/A',
        sku: mov.producto?.sku || null,
        factura_id: mov.factura_id,
        factura_numero: mov.factura?.numero || null,
        compra_id: mov.compra_id,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        usuario: (mov as any).usuario || 'Sistema',
      };
    });
  }

  async obtenerEstadisticas() {
    const productos = await this.productoRepository.find();

    const total_productos = productos.length;
    const stock_total = productos.reduce((sum, p) => sum + (p.stock || 0), 0);
    const productos_stock_bajo = productos.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.punto_reorden || 10)).length;
    const productos_sin_stock = productos.filter((p) => (p.stock || 0) === 0).length;

    // Calcular valor total del inventario
    let valor_total = 0;
    productos.forEach((p) => {
      const stock = p.stock || 0;
      const precio_costo = parseFloat(p.precio_costo?.toString() || '0') || 0;
      valor_total += stock * precio_costo;
    });

    // Calcular ventas y costo de ventas del día
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyFin = new Date(hoy);
    hoyFin.setHours(23, 59, 59, 999);

    const movimientosHoy = await this.movimientoRepository
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.producto', 'producto')
      .leftJoinAndSelect('movimiento.factura', 'factura')
      .where('movimiento.fecha >= :hoy', { hoy })
      .andWhere('movimiento.fecha <= :hoyFin', { hoyFin })
      .andWhere('movimiento.tipo = :tipo', { tipo: 'SALIDA' })
      .getMany();

    let ventas_hoy = 0;
    let costo_ventas_hoy = 0;

    for (const mov of movimientosHoy) {
      if (mov.producto) {
        const precio_costo = parseFloat(mov.producto.precio_costo?.toString() || '0') || 0;
        costo_ventas_hoy += mov.cantidad * precio_costo;

        // Si hay factura relacionada, obtener el precio de venta del detalle
        if (mov.factura_id && mov.factura) {
          // La factura ya tiene los detalles cargados si se usó la relación
          // Si no, usar el total de la factura como aproximación
          if (mov.factura.total) {
            // Buscar movimientos de esta factura para calcular proporción
            const movimientosFactura = await this.movimientoRepository.find({
              where: { factura_id: mov.factura_id },
            });
            const totalCantidadFactura = movimientosFactura.reduce((sum, m) => sum + m.cantidad, 0);
            if (totalCantidadFactura > 0) {
              const proporcion = mov.cantidad / totalCantidadFactura;
              ventas_hoy += mov.factura.total * proporcion;
            }
          }
        }
      }
    }

    return {
      total_productos,
      stock_total,
      productos_stock_bajo,
      productos_sin_stock,
      valor_total,
      ventas_hoy,
      costo_ventas_hoy,
    };
  }

  async obtenerStockBajo(limite: number = 10) {
    const productos = await this.productoRepository.find({
      where: { activo: true },
      order: { stock: 'ASC' },
    });

    return productos
      .filter((p) => p.stock <= limite)
      .map((producto) => ({
        id: producto.id,
        codigo: producto.codigo,
        sku: producto.sku,
        nombre: producto.nombre,
        stock: producto.stock,
        precio: producto.precio,
      }));
  }

  async obtenerAlertas() {
    return this.alertasService.obtenerAlertas();
  }

  async obtenerResumenAlertas() {
    return this.alertasService.obtenerResumenAlertas();
  }

  async obtenerProductosReorden() {
    return this.alertasService.obtenerProductosReorden();
  }

  async obtenerValoracionTotalInventario() {
    return this.valoracionService.obtenerValoracionTotalInventario();
  }

  // Métodos para manejar stock por punto de venta
  async obtenerInventarioPorPuntoVenta(puntoVentaId: number) {
    const productos = await this.productoRepository.find({
      order: { nombre: 'ASC' },
    });

    const productosConStock = await Promise.all(
      productos.map(async (producto) => {
        // Buscar stock específico del punto de venta
        let stockPuntoVenta = await this.productoPuntoVentaRepository.findOne({
          where: { producto_id: producto.id, punto_venta_id: puntoVentaId },
        });

        // Si no existe registro, crear uno con stock 0
        if (!stockPuntoVenta) {
          stockPuntoVenta = this.productoPuntoVentaRepository.create({
            producto_id: producto.id,
            punto_venta_id: puntoVentaId,
            stock: 0,
          });
          await this.productoPuntoVentaRepository.save(stockPuntoVenta);
        }

        return {
          ...producto,
          stock_punto_venta: stockPuntoVenta.stock,
          referencia: producto.referencia || '',
        };
      }),
    );

    return productosConStock;
  }

  async actualizarStockPuntoVenta(
    productoId: number,
    puntoVentaId: number,
    cantidad: number,
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE',
    queryRunner?: QueryRunner,
  ) {
    let stockPuntoVenta: ProductoPuntoVenta;

    if (queryRunner) {
      stockPuntoVenta = await queryRunner.manager.findOne(ProductoPuntoVenta, {
        where: { producto_id: productoId, punto_venta_id: puntoVentaId },
      });
    } else {
      stockPuntoVenta = await this.productoPuntoVentaRepository.findOne({
        where: { producto_id: productoId, punto_venta_id: puntoVentaId },
      });
    }

    if (!stockPuntoVenta) {
      if (queryRunner) {
        stockPuntoVenta = queryRunner.manager.create(ProductoPuntoVenta, {
          producto_id: productoId,
          punto_venta_id: puntoVentaId,
          stock: 0,
        });
      } else {
        stockPuntoVenta = this.productoPuntoVentaRepository.create({
          producto_id: productoId,
          punto_venta_id: puntoVentaId,
          stock: 0,
        });
      }
    }

    const stockAnterior = stockPuntoVenta.stock;
    let nuevoStock = stockAnterior;

    if (tipo === 'ENTRADA') {
      nuevoStock = stockAnterior + cantidad;
    } else if (tipo === 'SALIDA') {
      nuevoStock = Math.max(0, stockAnterior - cantidad);
    } else if (tipo === 'AJUSTE') {
      nuevoStock = cantidad;
    }

    stockPuntoVenta.stock = nuevoStock;

    if (queryRunner) {
      await queryRunner.manager.save(stockPuntoVenta);
    } else {
      await this.productoPuntoVentaRepository.save(stockPuntoVenta);
    }

    // Emitir evento de inventario actualizado (desacoplado de la transacción por defecto)
    if (this.eventsGateway) {
      this.eventsGateway.emitInventarioActualizado();
      // También emitir evento específico de punto de venta
      this.eventsGateway.server.emit('inventario-punto-venta-actualizado', {
        producto_id: productoId,
        punto_venta_id: puntoVentaId,
        stock_anterior: stockAnterior,
        stock_nuevo: nuevoStock,
        tipo: tipo,
      });
    }

    return {
      stock_anterior: stockAnterior,
      stock_nuevo: nuevoStock,
    };
  }

  async transferirStock(
    productoId: number,
    puntoVentaOrigen: number,
    puntoVentaDestino: number,
    cantidad: number,
  ) {
    // Verificar stock disponible en origen
    const stockOrigen = await this.productoPuntoVentaRepository.findOne({
      where: { producto_id: productoId, punto_venta_id: puntoVentaOrigen },
    });

    if (!stockOrigen || stockOrigen.stock < cantidad) {
      throw new Error('Stock insuficiente en el punto de venta origen');
    }

    // Restar del origen
    await this.actualizarStockPuntoVenta(
      productoId,
      puntoVentaOrigen,
      cantidad,
      'SALIDA',
    );

    // Sumar al destino
    await this.actualizarStockPuntoVenta(
      productoId,
      puntoVentaDestino,
      cantidad,
      'ENTRADA',
    );

    // Registrar movimiento de SALIDA en origen
    await this.registrarMovimiento({
      producto_id: productoId,
      tipo: 'SALIDA',
      cantidad: cantidad,
      motivo: `Transferencia a Punto de Venta ${puntoVentaDestino}`,
      observaciones: `Transferencia entre puntos de venta`,
      punto_venta_id: puntoVentaOrigen,
    });

    // Registrar movimiento de ENTRADA en destino
    await this.registrarMovimiento({
      producto_id: productoId,
      tipo: 'ENTRADA',
      cantidad: cantidad,
      motivo: `Transferencia desde Punto de Venta ${puntoVentaOrigen}`,
      observaciones: `Transferencia entre puntos de venta`,
      punto_venta_id: puntoVentaDestino,
    });

    // Emitir evento de transferencia
    if (this.eventsGateway) {
      this.eventsGateway.emitInventarioActualizado();
      this.eventsGateway.server.emit('transferencia-stock', {
        producto_id: productoId,
        punto_venta_origen: puntoVentaOrigen,
        punto_venta_destino: puntoVentaDestino,
        cantidad: cantidad,
      });
    }

    return { success: true };
  }
}



