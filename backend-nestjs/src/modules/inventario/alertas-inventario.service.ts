import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../productos/entities/producto.entity';

export interface AlertaInventario {
  tipo: string; // 'PUNTO_REORDEN', 'STOCK_SEGURIDAD', 'STOCK_CRITICO'
  producto_id: number;
  producto_nombre: string;
  producto_codigo: string;
  sku?: string;
  stock_actual: number;
  punto_reorden?: number;
  stock_seguridad?: number;
  mensaje: string;
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

@Injectable()
export class AlertasInventarioService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  /**
   * Calcular punto de reorden sugerido basado en tiempo de entrega
   */
  calcularPuntoReordenSugerido(
    demandaPromedioDiaria: number,
    tiempoEntregaDias: number,
    stockSeguridad: number = 0,
  ): number {
    // Punto de reorden = (Demanda promedio diaria × Tiempo de entrega) + Stock de seguridad
    return Math.ceil(demandaPromedioDiaria * tiempoEntregaDias) + stockSeguridad;
  }

  /**
   * Obtener todas las alertas de inventario
   */
  async obtenerAlertas(): Promise<AlertaInventario[]> {
    const productos = await this.productoRepository.find({
      where: { activo: true },
    });

    const alertas: AlertaInventario[] = [];

    for (const producto of productos) {
      const alertasProducto = this.evaluarAlertasProducto(producto);
      alertas.push(...alertasProducto);
    }

    // Ordenar por severidad (CRITICA > ALTA > MEDIA > BAJA)
    const ordenSeveridad = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
    alertas.sort((a, b) => ordenSeveridad[b.severidad] - ordenSeveridad[a.severidad]);

    return alertas;
  }

  /**
   * Evaluar alertas para un producto específico
   */
  evaluarAlertasProducto(producto: Producto): AlertaInventario[] {
    const alertas: AlertaInventario[] = [];
    const stock = producto.stock || 0;

    // Alerta: Stock crítico (0 o negativo)
    if (stock <= 0) {
      alertas.push({
        tipo: 'STOCK_CRITICO',
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_codigo: producto.codigo,
        sku: producto.sku,
        stock_actual: stock,
        mensaje: `Stock crítico: ${stock} unidades. Producto sin stock disponible.`,
        severidad: 'CRITICA',
      });
    }

    // Alerta: Punto de reorden
    if (producto.punto_reorden && stock <= producto.punto_reorden) {
      const diferencia = producto.punto_reorden - stock;
      const severidad = stock === 0 ? 'CRITICA' : stock <= producto.punto_reorden * 0.5 ? 'ALTA' : 'MEDIA';
      
      alertas.push({
        tipo: 'PUNTO_REORDEN',
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_codigo: producto.codigo,
        sku: producto.sku,
        stock_actual: stock,
        punto_reorden: producto.punto_reorden,
        mensaje: `Punto de reorden alcanzado: ${stock} unidades (umbral: ${producto.punto_reorden}). ${diferencia > 0 ? `Faltan ${diferencia} unidades para alcanzar el punto de reorden.` : 'Es momento de reordenar.'}`,
        severidad: severidad as any,
      });
    }

    // Alerta: Stock de seguridad
    if (producto.stock_seguridad && stock <= producto.stock_seguridad) {
      const diferencia = producto.stock_seguridad - stock;
      const severidad = stock === 0 ? 'CRITICA' : 'ALTA';
      
      alertas.push({
        tipo: 'STOCK_SEGURIDAD',
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_codigo: producto.codigo,
        sku: producto.sku,
        stock_actual: stock,
        stock_seguridad: producto.stock_seguridad,
        mensaje: `Stock de seguridad alcanzado: ${stock} unidades (mínimo: ${producto.stock_seguridad}). ${diferencia > 0 ? `Faltan ${diferencia} unidades para alcanzar el stock de seguridad.` : 'Riesgo de quiebre de stock.'}`,
        severidad: severidad as any,
      });
    }

    // Alerta: Stock bajo (menos de 10 unidades sin configuración)
    if (!producto.punto_reorden && stock > 0 && stock < 10) {
      alertas.push({
        tipo: 'STOCK_BAJO',
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_codigo: producto.codigo,
        sku: producto.sku,
        stock_actual: stock,
        mensaje: `Stock bajo: ${stock} unidades. Considera configurar punto de reorden.`,
        severidad: 'BAJA',
      });
    }

    return alertas;
  }

  /**
   * Obtener resumen de alertas
   */
  async obtenerResumenAlertas() {
    const alertas = await this.obtenerAlertas();

    return {
      total: alertas.length,
      criticas: alertas.filter(a => a.severidad === 'CRITICA').length,
      altas: alertas.filter(a => a.severidad === 'ALTA').length,
      medias: alertas.filter(a => a.severidad === 'MEDIA').length,
      bajas: alertas.filter(a => a.severidad === 'BAJA').length,
      alertas: alertas,
    };
  }

  /**
   * Obtener productos que requieren reorden
   */
  async obtenerProductosReorden() {
    const productos = await this.productoRepository.find({
      where: { activo: true },
    });

    return productos
      .filter(p => p.punto_reorden && (p.stock || 0) <= p.punto_reorden)
      .map(p => ({
        id: p.id,
        codigo: p.codigo,
        sku: p.sku,
        nombre: p.nombre,
        stock_actual: p.stock || 0,
        punto_reorden: p.punto_reorden,
        stock_seguridad: p.stock_seguridad,
        tiempo_entrega_dias: p.tiempo_entrega_dias,
        diferencia: (p.punto_reorden || 0) - (p.stock || 0),
        urgencia: (p.stock || 0) === 0 ? 'CRITICA' : 
                  (p.stock || 0) <= (p.punto_reorden || 0) * 0.5 ? 'ALTA' : 'MEDIA',
      }))
      .sort((a, b) => a.diferencia - b.diferencia);
  }
}
















