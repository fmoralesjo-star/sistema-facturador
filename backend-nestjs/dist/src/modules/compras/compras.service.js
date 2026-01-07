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
var ComprasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const compra_entity_1 = require("./entities/compra.entity");
const compra_detalle_entity_1 = require("./entities/compra-detalle.entity");
const proveedor_entity_1 = require("./entities/proveedor.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const inventario_service_1 = require("../inventario/inventario.service");
const contabilidad_service_1 = require("../contabilidad/contabilidad.service");
const events_gateway_1 = require("../../gateways/events.gateway");
const impuestos_service_1 = require("../sri/services/impuestos.service");
const retenciones_service_1 = require("./services/retenciones.service");
const xml2js_1 = require("xml2js");
let ComprasService = ComprasService_1 = class ComprasService {
    constructor(compraRepository, detalleRepository, productoRepository, dataSource, inventarioService, contabilidadService, eventsGateway, impuestosService, retencionesService) {
        this.compraRepository = compraRepository;
        this.detalleRepository = detalleRepository;
        this.productoRepository = productoRepository;
        this.dataSource = dataSource;
        this.inventarioService = inventarioService;
        this.contabilidadService = contabilidadService;
        this.eventsGateway = eventsGateway;
        this.impuestosService = impuestosService;
        this.retencionesService = retencionesService;
        this.logger = new common_1.Logger(ComprasService_1.name);
    }
    async create(createCompraDto) {
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
        const numeroCompra = createCompraDto.numero || `COMP-${Date.now()}`;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const compra = queryRunner.manager.create(compra_entity_1.Compra, {
                ...createCompraDto,
                numero: numeroCompra,
                subtotal,
                impuesto,
                total,
                estado: 'PENDIENTE',
                punto_venta_id: createCompraDto.punto_venta_id,
            });
            if (createCompraDto.proveedor_id) {
                const proveedor = await queryRunner.manager.findOne(proveedor_entity_1.Proveedor, { where: { id: createCompraDto.proveedor_id } });
                if (proveedor) {
                    const retRenta = await this.impuestosService.calcularRetencionRenta(subtotal, 'BIEN', proveedor);
                    compra.retencion_renta_codigo = retRenta.codigo;
                    compra.retencion_renta_porcentaje = retRenta.porcentaje;
                    compra.retencion_renta_valor = retRenta.valorRetenido;
                    const retIva = await this.impuestosService.calcularRetencionIva(impuesto, 'BIEN', proveedor);
                    compra.retencion_iva_codigo = retIva.codigo;
                    compra.retencion_iva_porcentaje = retIva.porcentaje;
                    compra.retencion_iva_valor = retIva.valorRetenido;
                }
            }
            const compraGuardada = await queryRunner.manager.save(compra);
            for (const detalle of detallesConSubtotal) {
                const compraDetalle = queryRunner.manager.create(compra_detalle_entity_1.CompraDetalle, {
                    compra_id: compraGuardada.id,
                    producto_id: detalle.producto_id,
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario,
                    subtotal: detalle.subtotal,
                });
                await queryRunner.manager.save(compraDetalle);
                await this.inventarioService.registrarMovimiento({
                    producto_id: detalle.producto_id,
                    tipo: 'ENTRADA',
                    cantidad: detalle.cantidad,
                    motivo: `Compra - ${numeroCompra}`,
                    observaciones: `Compra ID: ${compraGuardada.id}`,
                    compra_id: compraGuardada.id,
                    punto_venta_id: createCompraDto.punto_venta_id,
                }, queryRunner);
                if (createCompraDto.punto_venta_id) {
                    await this.inventarioService.actualizarStockPuntoVenta(detalle.producto_id, createCompraDto.punto_venta_id, detalle.cantidad, 'ENTRADA', queryRunner);
                }
                await queryRunner.manager.increment(producto_entity_1.Producto, { id: detalle.producto_id }, 'stock', detalle.cantidad);
            }
            await this.contabilidadService.crearAsientoCompra({
                ...compraGuardada,
                proveedor_id: createCompraDto.proveedor_id
            }, queryRunner);
            await queryRunner.commitTransaction();
            this.eventsGateway.emitCompraCreada(compraGuardada);
            this.eventsGateway.emitInventarioActualizado();
            if (createCompraDto.punto_venta_id) {
                this.eventsGateway.server.emit('compra-punto-venta', {
                    compra_id: compraGuardada.id,
                    punto_venta_id: createCompraDto.punto_venta_id,
                });
            }
            if ((compraGuardada.retencion_renta_valor && Number(compraGuardada.retencion_renta_valor) > 0) ||
                (compraGuardada.retencion_iva_valor && Number(compraGuardada.retencion_iva_valor) > 0)) {
                this.logger.log(`Iniciando emisión de retención para compra ${compraGuardada.id}...`);
                const compraCompleta = await this.compraRepository.findOne({
                    where: { id: compraGuardada.id },
                    relations: ['proveedor'],
                });
                this.retencionesService.emitirRetencion(compraCompleta)
                    .then((retencion) => {
                    this.logger.log(`Retención emitida: ${retencion.clave_acceso}, Estado: ${retencion.estado}`);
                    this.eventsGateway.server.emit('retencion-emitida', {
                        compra_id: compraGuardada.id,
                        retencion_id: retencion.id,
                        estado: retencion.estado,
                        clave_acceso: retencion.clave_acceso,
                    });
                })
                    .catch((error) => {
                    this.logger.error(`Error al emitir retención para compra ${compraGuardada.id}: ${error.message}`);
                    this.eventsGateway.server.emit('retencion-error', {
                        compra_id: compraGuardada.id,
                        error: error.message,
                    });
                });
            }
            return compraGuardada;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateEstado(id, estado) {
        const compra = await this.findOne(id);
        if (!compra) {
            throw new Error('Compra no encontrada');
        }
        compra.estado = estado;
        const saved = await this.compraRepository.save(compra);
        return saved;
    }
    async findAll() {
        return this.compraRepository.find({
            relations: ['detalles', 'detalles.producto', 'proveedor'],
            order: { fecha: 'DESC', id: 'DESC' },
        });
    }
    async findOne(id) {
        const compra = await this.compraRepository.findOne({
            where: { id },
            relations: ['detalles', 'detalles.producto', 'proveedor'],
        });
        if (!compra) {
            throw new common_1.NotFoundException(`Compra con ID ${id} no encontrada`);
        }
        return compra;
    }
    async importarXml(buffer) {
        const xml = buffer.toString('utf-8');
        const result = await (0, xml2js_1.parseStringPromise)(xml, { explicitArray: false });
        const docType = Object.keys(result)[0];
        const docContent = result[docType];
        if (!docContent || !docContent.infoTributaria) {
            throw new common_1.BadRequestException('Formato de XML no válido o desconocido');
        }
        const infoTrib = docContent.infoTributaria;
        const infoFact = docContent.infoFactura;
        let proveedor = await this.dataSource.getRepository(proveedor_entity_1.Proveedor).findOne({
            where: { ruc: infoTrib.ruc }
        });
        const detallesRaw = docContent.detalles?.detalle;
        const detallesList = Array.isArray(detallesRaw) ? detallesRaw : (detallesRaw ? [detallesRaw] : []);
        const detallesProcesados = await Promise.all(detallesList.map(async (det) => {
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
                impuesto_codigo: det.impuestos?.impuesto?.codigo,
                impuesto_porcentaje: det.impuestos?.impuesto?.tarifa,
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
    parseFechaSri(fechaStr) {
        const [day, month, year] = fechaStr.split('/');
        return `${year}-${month}-${day}`;
    }
};
exports.ComprasService = ComprasService;
exports.ComprasService = ComprasService = ComprasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(compra_entity_1.Compra)),
    __param(1, (0, typeorm_1.InjectRepository)(compra_detalle_entity_1.CompraDetalle)),
    __param(2, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        inventario_service_1.InventarioService,
        contabilidad_service_1.ContabilidadService,
        events_gateway_1.EventsGateway,
        impuestos_service_1.ImpuestosService,
        retenciones_service_1.RetencionesService])
], ComprasService);
//# sourceMappingURL=compras.service.js.map