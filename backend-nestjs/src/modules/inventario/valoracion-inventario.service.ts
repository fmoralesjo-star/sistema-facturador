import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoteInventario } from './entities/lote-inventario.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class ValoracionInventarioService {
  constructor(
    @InjectRepository(LoteInventario)
    private loteRepository: Repository<LoteInventario>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  /**
   * Registrar entrada de lote (FIFO/PEPS)
   */
  async registrarLote(data: {
    producto_id: number;
    numero_lote?: string;
    fecha_entrada: Date;
    fecha_vencimiento?: Date;
    cantidad: number;
    costo_unitario: number;
    precio_venta?: number;
    proveedor?: string;
    referencia_compra?: string;
  }) {
    const lote = this.loteRepository.create({
      producto_id: data.producto_id,
      numero_lote: data.numero_lote,
      fecha_entrada: new Date(data.fecha_entrada),
      fecha_vencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : null,
      cantidad_inicial: data.cantidad,
      cantidad_disponible: data.cantidad,
      costo_unitario: data.costo_unitario,
      precio_venta: data.precio_venta,
      proveedor: data.proveedor,
      referencia_compra: data.referencia_compra,
    });

    const loteGuardado = await this.loteRepository.save(lote);

    // Actualizar costo promedio del producto
    await this.actualizarCostoPromedio(data.producto_id);

    return loteGuardado;
  }

  /**
   * Aplicar salida FIFO (First In First Out)
   * Retorna los lotes utilizados y el costo total
   */
  async aplicarSalidaFIFO(productoId: number, cantidad: number) {
    // Obtener lotes disponibles ordenados por fecha de entrada (FIFO)
    const lotes = await this.loteRepository.find({
      where: { producto_id: productoId },
      order: { fecha_entrada: 'ASC', id: 'ASC' },
    });

    const lotesUtilizados: Array<{ lote_id: number; cantidad: number; costo_unitario: number }> = [];
    let cantidadRestante = cantidad;
    let costoTotal = 0;

    for (const lote of lotes) {
      if (cantidadRestante <= 0) break;

      if (lote.cantidad_disponible > 0) {
        const cantidadUsar = Math.min(cantidadRestante, lote.cantidad_disponible);
        
        lote.cantidad_disponible -= cantidadUsar;
        await this.loteRepository.save(lote);

        lotesUtilizados.push({
          lote_id: lote.id,
          cantidad: cantidadUsar,
          costo_unitario: lote.costo_unitario,
        });

        costoTotal += cantidadUsar * lote.costo_unitario;
        cantidadRestante -= cantidadUsar;
      }
    }

    // Actualizar costo promedio
    await this.actualizarCostoPromedio(productoId);

    return {
      lotes_utilizados: lotesUtilizados,
      costo_total: costoTotal,
      cantidad_atendida: cantidad - cantidadRestante,
      cantidad_faltante: cantidadRestante,
    };
  }

  /**
   * Calcular valoración de inventario por método FIFO
   */
  async calcularValoracionFIFO(productoId: number) {
    const lotes = await this.loteRepository.find({
      where: { producto_id: productoId },
      order: { fecha_entrada: 'ASC' },
    });

    let valoracionTotal = 0;
    let cantidadTotal = 0;

    for (const lote of lotes) {
      if (lote.cantidad_disponible > 0) {
        valoracionTotal += lote.cantidad_disponible * lote.costo_unitario;
        cantidadTotal += lote.cantidad_disponible;
      }
    }

    const costoPromedio = cantidadTotal > 0 ? valoracionTotal / cantidadTotal : 0;

    return {
      producto_id: productoId,
      cantidad_total: cantidadTotal,
      valoracion_total: valoracionTotal,
      costo_promedio: costoPromedio,
      lotes_activos: lotes.filter(l => l.cantidad_disponible > 0).length,
    };
  }

  /**
   * Actualizar costo promedio del producto
   */
  async actualizarCostoPromedio(productoId: number) {
    const valoracion = await this.calcularValoracionFIFO(productoId);
    
    const producto = await this.productoRepository.findOne({
      where: { id: productoId },
    });

    if (producto) {
      producto.costo_promedio = valoracion.costo_promedio;
      await this.productoRepository.save(producto);
    }

    return valoracion.costo_promedio;
  }

  /**
   * Obtener lotes disponibles para un producto (ordenados FIFO)
   */
  async obtenerLotesDisponibles(productoId: number) {
    return this.loteRepository.find({
      where: { producto_id: productoId },
      order: { fecha_entrada: 'ASC', id: 'ASC' },
    });
  }

  /**
   * Obtener valoración total del inventario
   */
  async obtenerValoracionTotalInventario() {
    const productos = await this.productoRepository.find();
    
    let valoracionTotal = 0;
    const valoraciones = [];

    for (const producto of productos) {
      const valoracion = await this.calcularValoracionFIFO(producto.id);
      valoracionTotal += valoracion.valoracion_total;
      
      valoraciones.push({
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_codigo: producto.codigo,
        ...valoracion,
      });
    }

    return {
      valoracion_total: valoracionTotal,
      productos: valoraciones,
    };
  }
}
















