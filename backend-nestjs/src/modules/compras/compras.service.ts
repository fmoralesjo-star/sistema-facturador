import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Proveedor } from './entities/proveedor.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { InventarioService } from '../inventario/inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { TaxEngineService } from '../sri/services/tax-engine.service';
import { RetencionesService } from './services/retenciones.service';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class ComprasService {
  private readonly logger = new Logger(ComprasService.name);

  constructor(
    @InjectRepository(Compra)
    private compraRepository: Repository<Compra>,
    @InjectRepository(CompraDetalle)
    private detalleRepository: Repository<CompraDetalle>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    private dataSource: DataSource,
    private inventarioService: InventarioService,
    private contabilidadService: ContabilidadService,
    private eventsGateway: EventsGateway,
    private impuestosService: TaxEngineService,
    private retencionesService: RetencionesService,
  ) { }

  async create(createCompraDto: CreateCompraDto) {
    // Calcular totales
    let subtotal = 0;
    const detallesConSubtotal = createCompraDto.detalles.map((detalle) => {
      const detalleSubtotal = detalle.cantidad * detalle.precio_unitario;
      subtotal += detalleSubtotal;
      return {
        ...detalle,
        subtotal: detalleSubtotal,
      };
    });

    const impuesto = createCompraDto.impuesto || 0;
    const total = subtotal + impuesto;

    // Generar número de compra si no se proporciona
    const numeroCompra = createCompraDto.numero || `COMP-${Date.now()}`;

    // Usar transacción para asegurar consistencia
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear compra
      const compra = queryRunner.manager.create(Compra, {
        ...createCompraDto,
        numero: numeroCompra,
        subtotal,
        impuesto,
        total,
        forma_pago: createCompraDto.forma_pago || 'Contado',
        estado: (createCompraDto.forma_pago === 'Contado' || !createCompraDto.forma_pago) ? 'PAGADA' : 'PENDIENTE',
        punto_venta_id: createCompraDto.punto_venta_id,
      });

      // --- INTEGRACION MOTOR DE IMPUESTOS ---
      if (createCompraDto.proveedor_id) {
        const proveedor = await queryRunner.manager.findOne(Proveedor, { where: { id: createCompraDto.proveedor_id } });
        if (proveedor) {
          // 1. Calcular Retención Renta
          const retRenta = await this.impuestosService.calcularRetencionRenta(
            subtotal,
            'BIEN', // Por defecto compra de bienes. TODO: Permitir diferenciar servicios desde DTO.
            proveedor
          );

          compra.retencion_renta_codigo = retRenta.codigo;
          compra.retencion_renta_porcentaje = retRenta.porcentaje;
          compra.retencion_renta_valor = retRenta.valorRetenido;

          // 2. Calcular Retención IVA
          const retIva = await this.impuestosService.calcularRetencionIva(
            impuesto,
            'BIEN',
            proveedor
          );

          compra.retencion_iva_codigo = retIva.codigo;
          compra.retencion_iva_porcentaje = retIva.porcentaje;
          compra.retencion_iva_valor = retIva.valorRetenido;
        }
      }
      // ---------------------------------------

      const compraGuardada = await queryRunner.manager.save(compra);

      // Crear detalles y actualizar inventario
      for (const detalle of detallesConSubtotal) {
        // Crear detalle
        const compraDetalle = queryRunner.manager.create(CompraDetalle, {
          compra_id: compraGuardada.id,
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
        });
        await queryRunner.manager.save(compraDetalle);

        // Registrar movimiento de inventario (ENTRADA)
        await this.inventarioService.registrarMovimiento(
          {
            producto_id: detalle.producto_id,
            tipo: 'ENTRADA',
            cantidad: detalle.cantidad,
            motivo: `Compra - ${numeroCompra}`,
            observaciones: `Compra ID: ${compraGuardada.id}`,
            compra_id: compraGuardada.id,
            punto_venta_id: createCompraDto.punto_venta_id,
          },
          queryRunner,
        );

        // Actualizar stock del punto de venta si existe
        if (createCompraDto.punto_venta_id) {
          await this.inventarioService.actualizarStockPuntoVenta(
            detalle.producto_id,
            createCompraDto.punto_venta_id,
            detalle.cantidad,
            'ENTRADA',
            queryRunner,
          );
        }

        // Actualizar stock
        await queryRunner.manager.increment(
          Producto,
          { id: detalle.producto_id },
          'stock',
          detalle.cantidad,
        );
      }

      // Crear asiento contable para compra (STRICT ACID: If this fails, rollback entire purchase)
      // Nota: Eliminamos el try-catch silencioso anterior para garantizar integridad.
      await this.contabilidadService.crearAsientoCompra({
        ...compraGuardada,
        // Pasamos datos calculados necesarios que podrían no estar en la entidad guardada aun si son transients
        proveedor_id: createCompraDto.proveedor_id
      }, queryRunner);

      await queryRunner.commitTransaction();

      // Emitir eventos
      this.eventsGateway.emitCompraCreada(compraGuardada);
      this.eventsGateway.emitInventarioActualizado();

      // Emitir evento específico de punto de venta si existe
      if (createCompraDto.punto_venta_id) {
        this.eventsGateway.server.emit('compra-punto-venta', {
          compra_id: compraGuardada.id,
          punto_venta_id: createCompraDto.punto_venta_id,
        });
      }

      // === EMISIÓN AUTOMÁTICA DE RETENCIÓN ELECTRÓNICA ===
      // Solo si hay valores de retención calculados
      if (
        (compraGuardada.retencion_renta_valor && Number(compraGuardada.retencion_renta_valor) > 0) ||
        (compraGuardada.retencion_iva_valor && Number(compraGuardada.retencion_iva_valor) > 0)
      ) {
        this.logger.log(`Iniciando emisión de retención para compra ${compraGuardada.id}...`);

        // Cargar la compra con relaciones necesarias
        const compraCompleta = await this.compraRepository.findOne({
          where: { id: compraGuardada.id },
          relations: ['proveedor'],
        });

        // Emitir retención en segundo plano (no bloquea la respuesta)
        this.retencionesService.emitirRetencion(compraCompleta)
          .then((retencion) => {
            this.logger.log(`Retención emitida: ${retencion.clave_acceso}, Estado: ${retencion.estado}`);
            // Emitir evento de retención emitida
            this.eventsGateway.server.emit('retencion-emitida', {
              compra_id: compraGuardada.id,
              retencion_id: retencion.id,
              estado: retencion.estado,
              clave_acceso: retencion.clave_acceso,
            });
          })
          .catch((error) => {
            this.logger.error(`Error al emitir retención para compra ${compraGuardada.id}: ${error.message}`);
            // Emitir evento de error
            this.eventsGateway.server.emit('retencion-error', {
              compra_id: compraGuardada.id,
              error: error.message,
            });
          });
      }

      return compraGuardada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateEstado(id: number, estado: string) {
    const compra = await this.findOne(id);
    if (!compra) {
      throw new Error('Compra no encontrada');
    }
    compra.estado = estado;

    // Si la compra se completa/paga, podríamos necesitar lógica adicional contable aquí en el futuro

    const saved = await this.compraRepository.save(compra);
    return saved;
  }

  async findAll() {
    return this.compraRepository.find({
      relations: ['detalles', 'detalles.producto', 'proveedor'],
      order: { fecha: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: ['detalles', 'detalles.producto', 'proveedor'],
    });

    if (!compra) {
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    }

    return compra;
  }

  async importarXml(buffer: Buffer) {
    const xml = buffer.toString('utf-8');
    const result = await parseStringPromise(xml, { explicitArray: false });

    // Detectar tipo de documento (Factura, Nota de Venta, etc...)
    // Estructura general SRI: factura -> infoTributaria + infoFactura + detalles
    const docType = Object.keys(result)[0]; // e.g., 'factura'
    const docContent = result[docType];

    if (!docContent || !docContent.infoTributaria) {
      throw new BadRequestException('Formato de XML no válido o desconocido');
    }

    const infoTrib = docContent.infoTributaria;
    const infoFact = docContent.infoFactura;

    // Buscar o sugerir proveedor
    let proveedor = await this.dataSource.getRepository(Proveedor).findOne({
      where: { ruc: infoTrib.ruc }
    });

    // Mapear detalles
    const detallesRaw = docContent.detalles?.detalle;
    const detallesList = Array.isArray(detallesRaw) ? detallesRaw : (detallesRaw ? [detallesRaw] : []);

    const detallesProcesados = await Promise.all(detallesList.map(async (det: any) => {
      // Buscar producto por código principal o auxiliar
      const codigo = det.codigoPrincipal || det.codigoAuxiliar || 'SIN-CODIGO';
      const producto = await this.productoRepository.findOne({ where: { codigo } });

      return {
        producto_id: producto?.id || '',
        codigo: codigo,
        cantidad: Number(det.cantidad),
        descripcion: det.descripcion,
        precio_unitario: Number(det.precioUnitario),
        descuento: Number(det.descuento || 0),
        subtotal: Number(det.precioTotalSinImpuesto),
        impuesto_codigo: det.impuestos?.impuesto?.codigo, // 2 para IVA
        impuesto_porcentaje: det.impuestos?.impuesto?.tarifa, // 15
      };
    }));

    return {
      proveedor: {
        codigo: infoTrib.ruc,
        nombre: infoTrib.razonSocial,
        direccion: infoTrib.dirMatriz,
        existente: !!proveedor,
        id: proveedor?.id
      },
      compra: {
        numero_comprobante: `${infoTrib.estab}-${infoTrib.ptoEmi}-${infoTrib.secuencial}`,
        fecha_compra: this.parseFechaSri(infoFact.fechaEmision),
        tipo_comprobante: 'Factura',
        total: Number(infoFact.importeTotal),
        autorizacion: infoTrib.claveAcceso
      },
      detalles: detallesProcesados
    };
  }

  private parseFechaSri(fechaStr: string) {
    // dd/mm/yyyy -> yyyy-mm-dd
    const [day, month, year] = fechaStr.split('/');
    return `${year}-${month}-${day}`;
  }
}
