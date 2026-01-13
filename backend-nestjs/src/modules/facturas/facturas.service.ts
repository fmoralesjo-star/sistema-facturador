import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { FacturaDetalle } from './entities/factura-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { SriService } from '../sri/sri.service';
import { InventarioService } from '../inventario/inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { EmpresaService } from '../empresa/empresa.service';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class FacturasService implements OnModuleInit {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    @InjectRepository(FacturaDetalle)
    private detalleRepository: Repository<FacturaDetalle>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    private dataSource: DataSource,
    private sriService: SriService,
    private inventarioService: InventarioService,
    private contabilidadService: ContabilidadService,
    private empresaService: EmpresaService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) { }

  async onModuleInit() {
    // Crear Trigger de Stock automáticamente al iniciar el módulo
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // 1. Crear Función
      await queryRunner.query(`
          CREATE OR REPLACE FUNCTION public.actualizar_stock_venta()
          RETURNS trigger
          LANGUAGE plpgsql
          AS $function$
          DECLARE
              v_punto_venta_id integer;
          BEGIN
              -- Obtenemos el punto de venta de la factura cabecera
              SELECT punto_venta_id INTO v_punto_venta_id
              FROM facturas
              WHERE id = NEW.factura_id;

              -- Si hay punto de venta, actualizar stock específico
              IF v_punto_venta_id IS NOT NULL THEN
                  UPDATE productos_puntos_venta
                  SET stock = stock - NEW.cantidad,
                      updated_at = NOW()
                  WHERE producto_id = NEW.producto_id 
                    AND punto_venta_id = v_punto_venta_id;
                  
                  IF NOT FOUND THEN
                     INSERT INTO productos_puntos_venta (producto_id, punto_venta_id, stock, created_at, updated_at)
                     VALUES (NEW.producto_id, v_punto_venta_id, -NEW.cantidad, NOW(), NOW());
                  END IF;
              END IF;

              -- 2. Restar del Stock Global (Tabla productos)
              UPDATE productos
              SET stock = stock - NEW.cantidad,
                  updated_at = NOW()
              WHERE id = NEW.producto_id;

              RETURN NEW;
          END;
          $function$;
        `);

      // 2. Crear Trigger
      await queryRunner.query(`
          DROP TRIGGER IF EXISTS trigger_actualizar_stock_venta ON factura_detalles;
          CREATE TRIGGER trigger_actualizar_stock_venta
          AFTER INSERT ON factura_detalles
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_stock_venta();
        `);

      await queryRunner.release();
      console.log('✅ Trigger de Stock "actualizar_stock_venta" verificado/creado correctamente');
    } catch (error) {
      console.error('❌ Error creando trigger de stock:', error);
      // No lanzamos error para no detener el arranque, pero logueamos fuerte
    }
  }

  async create(createFacturaDto: CreateFacturaDto) {
    // Validar stock antes de crear la factura
    await this.validarStock(createFacturaDto.detalles);

    // Calcular totales
    let subtotal = 0;
    const detallesConSubtotal = createFacturaDto.detalles.map((detalle) => {
      const detalleSubtotal = detalle.cantidad * detalle.precio_unitario;
      subtotal += detalleSubtotal;
      return {
        ...detalle,
        subtotal: detalleSubtotal,
      };
    });

    const impuesto = createFacturaDto.impuesto || 0;
    const total = subtotal + impuesto;

    // Generar número de factura si no se proporciona
    const numeroFactura =
      createFacturaDto.numero || `FAC-${Date.now()}`;

    // Obtener empresa activa si no se proporciona empresa_id
    let empresaId = createFacturaDto.empresa_id;
    if (!empresaId) {
      const empresaActiva = await this.empresaService.findActive();
      if (empresaActiva) {
        empresaId = empresaActiva.id;
      }
    }

    // Si hay empresa, completar datos del emisor desde la empresa
    let datosEmisor = {};
    if (empresaId) {
      const empresa = await this.empresaService.findOne(empresaId);
      datosEmisor = {
        emisor_ruc: empresa.ruc,
        emisor_razon_social: empresa.razon_social,
        emisor_nombre_comercial: empresa.nombre_comercial || empresa.razon_social,
        emisor_direccion_matriz: empresa.direccion_matriz,
        emisor_direccion_establecimiento: empresa.direccion_establecimiento || empresa.direccion_matriz,
        emisor_telefono: empresa.telefono,
        emisor_email: empresa.email,
        establecimiento: empresa.codigo_establecimiento || '001',
        punto_emision: empresa.punto_emision || '001',
      };
    }

    // Usar transacción para asegurar consistencia
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear factura con datos de empresa
      const factura = queryRunner.manager.create(Factura, {
        ...createFacturaDto,
        ...datosEmisor,
        empresa_id: empresaId,
        numero: numeroFactura,
        subtotal,
        impuesto,
        total,
        estado: 'PENDIENTE',
        asiento_contable_creado: false,
      });

      const facturaGuardada = await queryRunner.manager.save(factura);

      // Crear detalles y actualizar inventario
      for (const detalle of detallesConSubtotal) {
        // Crear detalle
        const facturaDetalle = queryRunner.manager.create(FacturaDetalle, {
          factura_id: facturaGuardada.id,
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
          talla: detalle.talla,
          color: detalle.color,
        });
        // Nota: Al hacer save(), se dispara el Trigger 'trigger_actualizar_stock_venta' en la DB
        await queryRunner.manager.save(facturaDetalle);

        // Registrar movimiento de inventario (SALIDA - LOG ONLY)
        await this.inventarioService.registrarMovimiento(
          {
            producto_id: detalle.producto_id,
            tipo: 'SALIDA',
            cantidad: detalle.cantidad,
            motivo: `Venta - ${numeroFactura}`,
            observaciones: `Factura ID: ${facturaGuardada.id}`,
            factura_id: facturaGuardada.id,
            punto_venta_id: createFacturaDto.punto_venta_id,
          },
          queryRunner,
        );
      }

      // 3. Contabilidad: Se delega al SRI Processor (cuando se AUTORICE)
      // Anteriormente se creaba aquí, pero se cambió a requerimiento: "Al autorizar una factura en el SRI"
      // El asiento se generará en SriProcessor.processNextJob

      // Generar clave de acceso
      const claveAcceso = this.sriService.generarClaveAcceso(facturaGuardada);

      // Actualizar factura con clave de acceso
      facturaGuardada.clave_acceso = claveAcceso;
      await queryRunner.manager.save(Factura, facturaGuardada);

      // Generar XML y enviar al SRI (asíncrono)
      const xmlContent = await this.sriService.generarXMLFactura(facturaGuardada);

      await this.sriService.enviarFacturaAlSri({
        facturaId: facturaGuardada.id,
        xmlContent,
        ambiente: (createFacturaDto.ambiente || '2') === '1' ? 'produccion' : 'pruebas',
        claveAcceso,
      });

      await queryRunner.commitTransaction();

      // Retornar factura completa
      return this.findOne(facturaGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.facturaRepository.find({
      relations: ['cliente', 'detalles', 'detalles.producto', 'empresa'],
      order: { fecha: 'DESC', id: 'DESC' },
    });
  }

  /**
   * Obtiene estadísticas de facturas para el dashboard
   */
  async obtenerEstadisticas(): Promise<{
    total_facturado_mes: number;
    iva_por_pagar: number;
    comprobantes_rechazados: number;
    comprobantes_autorizados: number;
    comprobantes_pendientes: number;
    total_facturas: number;
  }> {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

    // Obtener todas las facturas del mes actual
    const facturasMes = await this.facturaRepository.find({
      where: {
        fecha: {
          $gte: inicioMes,
          $lte: finMes,
        } as any,
      },
    });

    // Calcular total facturado del mes
    const totalFacturadoMes = facturasMes.reduce(
      (sum, factura) => sum + parseFloat(factura.total.toString()),
      0,
    );

    // Calcular IVA por pagar (suma de impuestos de facturas autorizadas)
    const facturasAutorizadas = facturasMes.filter(
      (f) => f.estado_sri === 'AUTORIZADO' || f.estado === 'AUTORIZADO',
    );
    const ivaPorPagar = facturasAutorizadas.reduce(
      (sum, factura) => sum + parseFloat(factura.impuesto.toString()),
      0,
    );

    // Contar comprobantes por estado
    const comprobantesRechazados = facturasMes.filter(
      (f) => f.estado_sri === 'NO AUTORIZADO' || f.estado_sri === 'RECHAZADO',
    ).length;

    const comprobantesAutorizados = facturasAutorizadas.length;

    const comprobantesPendientes = facturasMes.filter(
      (f) => !f.estado_sri || f.estado_sri === 'PENDIENTE' || f.estado_sri === 'EN PROCESO',
    ).length;

    return {
      total_facturado_mes: totalFacturadoMes,
      iva_por_pagar: ivaPorPagar,
      comprobantes_rechazados: comprobantesRechazados,
      comprobantes_autorizados: comprobantesAutorizados,
      comprobantes_pendientes: comprobantesPendientes,
      total_facturas: facturasMes.length,
    };
  }

  /**
   * Busca facturas con filtros
   */
  async buscarFacturas(filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    clienteId?: number;
    estadoSri?: string;
  }) {
    const query = this.facturaRepository.createQueryBuilder('factura')
      .leftJoinAndSelect('factura.cliente', 'cliente')
      .leftJoinAndSelect('factura.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .leftJoinAndSelect('factura.empresa', 'empresa');

    if (filtros.fechaInicio) {
      query.andWhere('factura.fecha >= :fechaInicio', {
        fechaInicio: filtros.fechaInicio,
      });
    }

    if (filtros.fechaFin) {
      query.andWhere('factura.fecha <= :fechaFin', {
        fechaFin: filtros.fechaFin,
      });
    }

    if (filtros.clienteId) {
      query.andWhere('factura.cliente_id = :clienteId', {
        clienteId: filtros.clienteId,
      });
    }

    if (filtros.estadoSri) {
      query.andWhere('factura.estado_sri = :estadoSri', {
        estadoSri: filtros.estadoSri,
      });
    }

    query.orderBy('factura.fecha', 'DESC').addOrderBy('factura.id', 'DESC');

    return query.getMany();
  }

  async findOne(id: number) {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['cliente', 'detalles', 'detalles.producto'],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return factura;
  }

  async validarStock(detalles: CreateFacturaDto['detalles']) {
    const productosIds = detalles.map((d) => d.producto_id);
    const productos = await this.productoRepository.find({
      where: { id: In(productosIds) },
    });

    const productosMap = new Map(productos.map((p) => [p.id, p]));
    const errores: string[] = [];

    for (const detalle of detalles) {
      const producto = productosMap.get(detalle.producto_id);
      if (!producto) {
        errores.push(`Producto ID ${detalle.producto_id} no encontrado`);
      } else if (producto.stock < detalle.cantidad) {
        errores.push(
          `${producto.nombre}: Stock insuficiente (disponible: ${producto.stock}, solicitado: ${detalle.cantidad})`,
        );
      }
    }

    if (errores.length > 0) {
      throw new BadRequestException({
        error: 'Stock insuficiente',
        detalles: errores,
      });
    }
  }

  async updateEstado(id: number, estado: string) {
    const factura = await this.findOne(id);
    factura.estado = estado;
    const saved = await this.facturaRepository.save(factura);
    this.eventsGateway.emitFacturaActualizada(saved);
    return saved;
  }

  async anular(id: number) {
    const factura = await this.findOne(id);
    if (!factura) throw new NotFoundException('Factura no encontrada');

    if (factura.estado === 'ANULADA') {
      throw new BadRequestException('La factura ya está anulada');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Cambiar estado
      await queryRunner.manager.update(Factura, id, { estado: 'ANULADA' });

      // 2. Revertir stock
      for (const detalle of factura.detalles || []) {
        await this.inventarioService.registrarMovimientoConActualizacion({
          producto_id: detalle.producto_id,
          tipo: 'ENTRADA',
          cantidad: detalle.cantidad,
          motivo: `Anulación de Factura ${factura.numero}`,
        }, queryRunner);
      }

      // 3. Revertir contabilidad
      try {
        await this.contabilidadService.anularAsientoFactura(factura, { queryRunner } as any);
      } catch (error) {
        console.error(`Error al anular siento contable: ${error.message}`);
        // No fallamos la anulación si contabilidad falla (por ahora), o sí?
        // El usuario pidió robustez. Si falla la reversión contable, debería fallar la anulación.
        throw new Error(`Error revirtiendo contabilidad: ${error.message}`);
      }

      await queryRunner.commitTransaction();
      return { success: true, message: `Factura ${factura.numero} anulada correctamente` };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error anulando factura: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}

