import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenCompra } from './entities/orden-compra.entity';
import { OrdenCompraDetalle } from './entities/orden-compra-detalle.entity';
import { Albaran } from './entities/albaran.entity';
import { AlbaranDetalle } from './entities/albaran-detalle.entity';
import { Transferencia } from './entities/transferencia.entity';
import { TransferenciaDetalle } from './entities/transferencia-detalle.entity';
import { AjusteInventario } from './entities/ajuste-inventario.entity';
import { Picking } from './entities/picking.entity';
import { PickingDetalle } from './entities/picking-detalle.entity';
import { ConteoCiclico } from './entities/conteo-ciclico.entity';
import { ConteoCiclicoDetalle } from './entities/conteo-ciclico-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Inject, forwardRef } from '@nestjs/common';
import { InventarioService } from './inventario.service';

@Injectable()
export class FlujosOperativosService {
  constructor(
    @InjectRepository(OrdenCompra)
    private ordenCompraRepository: Repository<OrdenCompra>,
    @InjectRepository(OrdenCompraDetalle)
    private ordenCompraDetalleRepository: Repository<OrdenCompraDetalle>,
    @InjectRepository(Albaran)
    private albaranRepository: Repository<Albaran>,
    @InjectRepository(AlbaranDetalle)
    private albaranDetalleRepository: Repository<AlbaranDetalle>,
    @InjectRepository(Transferencia)
    private transferenciaRepository: Repository<Transferencia>,
    @InjectRepository(TransferenciaDetalle)
    private transferenciaDetalleRepository: Repository<TransferenciaDetalle>,
    @InjectRepository(AjusteInventario)
    private ajusteInventarioRepository: Repository<AjusteInventario>,
    @InjectRepository(Picking)
    private pickingRepository: Repository<Picking>,
    @InjectRepository(PickingDetalle)
    private pickingDetalleRepository: Repository<PickingDetalle>,
    @InjectRepository(ConteoCiclico)
    private conteoCiclicoRepository: Repository<ConteoCiclico>,
    @InjectRepository(ConteoCiclicoDetalle)
    private conteoCiclicoDetalleRepository: Repository<ConteoCiclicoDetalle>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @Inject(forwardRef(() => InventarioService))
    private inventarioService: InventarioService,
  ) {}

  // ========== A. RECEPCIÓN Y COMPRAS (INBOUND) ==========

  async crearOrdenCompra(data: any) {
    const orden = this.ordenCompraRepository.create({
      numero: data.numero || `OC-${Date.now()}`,
      fecha_orden: new Date(data.fecha_orden),
      fecha_esperada: data.fecha_esperada ? new Date(data.fecha_esperada) : null,
      proveedor: data.proveedor,
      estado: 'PENDIENTE',
      observaciones: data.observaciones,
    });

    const ordenGuardada = await this.ordenCompraRepository.save(orden);

    if (data.detalles && data.detalles.length > 0) {
      const detalles = data.detalles.map((det: any) =>
        this.ordenCompraDetalleRepository.create({
          orden_compra_id: ordenGuardada.id,
          producto_id: det.producto_id,
          cantidad_pedida: det.cantidad_pedida,
          precio_unitario: det.precio_unitario,
        }),
      );
      await this.ordenCompraDetalleRepository.save(detalles);
    }

    return this.ordenCompraRepository.findOne({
      where: { id: ordenGuardada.id },
      relations: ['detalles', 'detalles.producto'],
    });
  }

  async crearAlbaran(data: any) {
    const albaran = this.albaranRepository.create({
      numero: data.numero || `ALB-${Date.now()}`,
      fecha_recepcion: new Date(data.fecha_recepcion),
      orden_compra_id: data.orden_compra_id,
      estado: 'PENDIENTE',
      usuario_recepcion: data.usuario_recepcion,
      observaciones: data.observaciones,
    });

    const albaranGuardado = await this.albaranRepository.save(albaran);

    if (data.detalles && data.detalles.length > 0) {
      const detalles = await Promise.all(
        data.detalles.map(async (det: any) => {
          const cantidadFaltante = Math.max(0, det.cantidad_esperada - det.cantidad_recibida);
          const estado =
            cantidadFaltante > 0 || det.cantidad_danada > 0 ? 'DISCREPANCIA' : 'OK';

          return this.albaranDetalleRepository.create({
            albaran_id: albaranGuardado.id,
            producto_id: det.producto_id,
            cantidad_esperada: det.cantidad_esperada,
            cantidad_recibida: det.cantidad_recibida,
            cantidad_faltante: cantidadFaltante,
            cantidad_danada: det.cantidad_danada || 0,
            estado: estado,
            observaciones: det.observaciones,
          });
        }),
      );

      await this.albaranDetalleRepository.save(detalles);

      // Actualizar orden de compra con cantidades recibidas
      if (data.orden_compra_id) {
        for (const det of data.detalles) {
          const ordenDetalle = await this.ordenCompraDetalleRepository.findOne({
            where: {
              orden_compra_id: data.orden_compra_id,
              producto_id: det.producto_id,
            },
          });
          if (ordenDetalle) {
            ordenDetalle.cantidad_recibida += det.cantidad_recibida;
            await this.ordenCompraDetalleRepository.save(ordenDetalle);
          }
        }
      }

      // Registrar movimientos de inventario para productos recibidos
      for (const det of data.detalles) {
        if (det.cantidad_recibida > 0) {
          await this.inventarioService.registrarMovimiento({
            producto_id: det.producto_id,
            tipo: 'ENTRADA',
            cantidad: det.cantidad_recibida,
            motivo: `Recepción Albarán ${albaranGuardado.numero}`,
            observaciones: `Albarán: ${albaranGuardado.numero}`,
          });
        }
      }
    }

    // Actualizar estado del albarán
    const albaranCompleto = await this.albaranRepository.findOne({
      where: { id: albaranGuardado.id },
      relations: ['detalles'],
    });

    const tieneDiscrepancias = albaranCompleto.detalles.some(
      (d) => d.estado === 'DISCREPANCIA',
    );
    albaranCompleto.estado = tieneDiscrepancias ? 'CON_DISCREPANCIAS' : 'CONCILIADO';
    await this.albaranRepository.save(albaranCompleto);

    return this.albaranRepository.findOne({
      where: { id: albaranGuardado.id },
      relations: ['detalles', 'detalles.producto', 'orden_compra'],
    });
  }

  // ========== B. MOVIMIENTOS DE INVENTARIO ==========

  async crearTransferencia(data: any) {
    const transferencia = this.transferenciaRepository.create({
      numero: data.numero || `TRANS-${Date.now()}`,
      fecha: new Date(data.fecha),
      origen: data.origen,
      destino: data.destino,
      estado: 'PENDIENTE',
      usuario_envio: data.usuario_envio,
      observaciones: data.observaciones,
    });

    const transferenciaGuardada = await this.transferenciaRepository.save(transferencia);

    if (data.detalles && data.detalles.length > 0) {
      const detalles = data.detalles.map((det: any) =>
        this.transferenciaDetalleRepository.create({
          transferencia_id: transferenciaGuardada.id,
          producto_id: det.producto_id,
          cantidad: det.cantidad,
        }),
      );
      await this.transferenciaDetalleRepository.save(detalles);
    }

    return this.transferenciaRepository.findOne({
      where: { id: transferenciaGuardada.id },
      relations: ['detalles', 'detalles.producto'],
    });
  }

  async registrarAjuste(data: any) {
    const producto = await this.productoRepository.findOne({
      where: { id: data.producto_id },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${data.producto_id} no encontrado`);
    }

    const diferencia = data.cantidad_nueva - producto.stock;

    const ajuste = this.ajusteInventarioRepository.create({
      numero: data.numero || `AJU-${Date.now()}`,
      fecha: new Date(data.fecha),
      producto_id: data.producto_id,
      cantidad_anterior: producto.stock,
      cantidad_nueva: data.cantidad_nueva,
      diferencia: diferencia,
      motivo: data.motivo,
      motivo_detalle: data.motivo_detalle,
      usuario_responsable: data.usuario_responsable,
      observaciones: data.observaciones,
    });

    await this.ajusteInventarioRepository.save(ajuste);

    // Actualizar stock del producto
    producto.stock = data.cantidad_nueva;
    await this.productoRepository.save(producto);

    // Registrar movimiento de inventario
    const tipoMovimiento = diferencia > 0 ? 'ENTRADA' : diferencia < 0 ? 'SALIDA' : 'AJUSTE';
    await this.inventarioService.registrarMovimiento({
      producto_id: data.producto_id,
      tipo: tipoMovimiento,
      cantidad: Math.abs(diferencia),
      motivo: `Ajuste: ${data.motivo}`,
      observaciones: data.motivo_detalle || data.observaciones,
    });

    return ajuste;
  }

  // ========== C. DESPACHO Y VENTAS (OUTBOUND) ==========

  async crearPicking(data: any) {
    const picking = this.pickingRepository.create({
      numero: data.numero || `PICK-${Date.now()}`,
      fecha: new Date(data.fecha),
      orden_venta: data.orden_venta,
      estado: 'PENDIENTE',
      operario: data.operario,
    });

    const pickingGuardado = await this.pickingRepository.save(picking);

    if (data.detalles && data.detalles.length > 0) {
      const detalles = data.detalles.map((det: any, index: number) =>
        this.pickingDetalleRepository.create({
          picking_id: pickingGuardado.id,
          producto_id: det.producto_id,
          ubicacion_id: det.ubicacion_id,
          cantidad_solicitada: det.cantidad_solicitada,
          orden_picking: det.orden_picking || index + 1,
        }),
      );
      await this.pickingDetalleRepository.save(detalles);
    }

    return this.pickingRepository.findOne({
      where: { id: pickingGuardado.id },
      relations: ['detalles', 'detalles.producto', 'detalles.ubicacion'],
    });
  }

  // ========== D. AUDITORÍA (STOCK TAKING) ==========

  async crearConteoCiclico(data: any) {
    const conteo = this.conteoCiclicoRepository.create({
      numero: data.numero || `CONT-${Date.now()}`,
      fecha: new Date(data.fecha),
      categoria: data.categoria,
      ubicacion: data.ubicacion,
      estado: 'PENDIENTE',
      usuario_responsable: data.usuario_responsable,
      observaciones: data.observaciones,
    });

    const conteoGuardado = await this.conteoCiclicoRepository.save(conteo);

    if (data.detalles && data.detalles.length > 0) {
      const detalles = await Promise.all(
        data.detalles.map(async (det: any) => {
          const producto = await this.productoRepository.findOne({
            where: { id: det.producto_id },
          });

          return this.conteoCiclicoDetalleRepository.create({
            conteo_id: conteoGuardado.id,
            producto_id: det.producto_id,
            cantidad_sistema: producto?.stock || 0,
            cantidad_fisica: null,
            diferencia: null,
            estado: 'PENDIENTE',
          });
        }),
      );
      await this.conteoCiclicoDetalleRepository.save(detalles);
    }

    return this.conteoCiclicoRepository.findOne({
      where: { id: conteoGuardado.id },
      relations: ['detalles', 'detalles.producto'],
    });
  }

  // Métodos de consulta
  async obtenerOrdenesCompra() {
    return this.ordenCompraRepository.find({
      relations: ['detalles', 'detalles.producto'],
      order: { fecha_orden: 'DESC' },
    });
  }

  async obtenerAlbaranes() {
    return this.albaranRepository.find({
      relations: ['detalles', 'detalles.producto', 'orden_compra'],
      order: { fecha_recepcion: 'DESC' },
    });
  }

  async obtenerTransferencias() {
    return this.transferenciaRepository.find({
      relations: ['detalles', 'detalles.producto'],
      order: { fecha: 'DESC' },
    });
  }

  async obtenerAjustes() {
    return this.ajusteInventarioRepository.find({
      relations: ['producto'],
      order: { fecha: 'DESC' },
    });
  }

  async obtenerPickings() {
    return this.pickingRepository.find({
      relations: ['detalles', 'detalles.producto', 'detalles.ubicacion'],
      order: { fecha: 'DESC' },
    });
  }

  async obtenerConteosCiclicos() {
    return this.conteoCiclicoRepository.find({
      relations: ['detalles', 'detalles.producto'],
      order: { fecha: 'DESC' },
    });
  }
}

