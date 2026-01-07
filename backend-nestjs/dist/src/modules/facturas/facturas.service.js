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
exports.FacturasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("./entities/factura.entity");
const factura_detalle_entity_1 = require("./entities/factura-detalle.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const sri_service_1 = require("../sri/sri.service");
const inventario_service_1 = require("../inventario/inventario.service");
const contabilidad_service_1 = require("../contabilidad/contabilidad.service");
const empresa_service_1 = require("../empresa/empresa.service");
const events_gateway_1 = require("../../gateways/events.gateway");
let FacturasService = class FacturasService {
    constructor(facturaRepository, detalleRepository, productoRepository, dataSource, sriService, inventarioService, contabilidadService, empresaService, eventsGateway) {
        this.facturaRepository = facturaRepository;
        this.detalleRepository = detalleRepository;
        this.productoRepository = productoRepository;
        this.dataSource = dataSource;
        this.sriService = sriService;
        this.inventarioService = inventarioService;
        this.contabilidadService = contabilidadService;
        this.empresaService = empresaService;
        this.eventsGateway = eventsGateway;
    }
    async create(createFacturaDto) {
        await this.validarStock(createFacturaDto.detalles);
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
        const numeroFactura = createFacturaDto.numero || `FAC-${Date.now()}`;
        let empresaId = createFacturaDto.empresa_id;
        if (!empresaId) {
            const empresaActiva = await this.empresaService.findActive();
            if (empresaActiva) {
                empresaId = empresaActiva.id;
            }
        }
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
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const factura = queryRunner.manager.create(factura_entity_1.Factura, {
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
            for (const detalle of detallesConSubtotal) {
                const facturaDetalle = queryRunner.manager.create(factura_detalle_entity_1.FacturaDetalle, {
                    factura_id: facturaGuardada.id,
                    producto_id: detalle.producto_id,
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario,
                    subtotal: detalle.subtotal,
                });
                await queryRunner.manager.save(facturaDetalle);
                await this.inventarioService.registrarMovimiento({
                    producto_id: detalle.producto_id,
                    tipo: 'SALIDA',
                    cantidad: detalle.cantidad,
                    motivo: `Venta - ${numeroFactura}`,
                    observaciones: `Factura ID: ${facturaGuardada.id}`,
                    factura_id: facturaGuardada.id,
                    punto_venta_id: createFacturaDto.punto_venta_id,
                }, queryRunner);
                if (createFacturaDto.punto_venta_id) {
                    await this.inventarioService.actualizarStockPuntoVenta(detalle.producto_id, createFacturaDto.punto_venta_id, detalle.cantidad, 'SALIDA', queryRunner);
                }
                await queryRunner.manager.decrement(producto_entity_1.Producto, { id: detalle.producto_id }, 'stock', detalle.cantidad);
            }
            const claveAcceso = this.sriService.generarClaveAcceso(facturaGuardada);
            facturaGuardada.clave_acceso = claveAcceso;
            await queryRunner.manager.save(factura_entity_1.Factura, facturaGuardada);
            const xmlContent = await this.sriService.generarXMLFactura(facturaGuardada);
            await this.sriService.enviarFacturaAlSri({
                facturaId: facturaGuardada.id,
                xmlContent,
                ambiente: (createFacturaDto.ambiente || '2') === '1' ? 'produccion' : 'pruebas',
                claveAcceso,
            });
            await queryRunner.commitTransaction();
            return this.findOne(facturaGuardada.id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll() {
        return this.facturaRepository.find({
            relations: ['cliente', 'detalles', 'detalles.producto', 'empresa'],
            order: { fecha: 'DESC', id: 'DESC' },
        });
    }
    async obtenerEstadisticas() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
        const facturasMes = await this.facturaRepository.find({
            where: {
                fecha: {
                    $gte: inicioMes,
                    $lte: finMes,
                },
            },
        });
        const totalFacturadoMes = facturasMes.reduce((sum, factura) => sum + parseFloat(factura.total.toString()), 0);
        const facturasAutorizadas = facturasMes.filter((f) => f.estado_sri === 'AUTORIZADO' || f.estado === 'AUTORIZADO');
        const ivaPorPagar = facturasAutorizadas.reduce((sum, factura) => sum + parseFloat(factura.impuesto.toString()), 0);
        const comprobantesRechazados = facturasMes.filter((f) => f.estado_sri === 'NO AUTORIZADO' || f.estado_sri === 'RECHAZADO').length;
        const comprobantesAutorizados = facturasAutorizadas.length;
        const comprobantesPendientes = facturasMes.filter((f) => !f.estado_sri || f.estado_sri === 'PENDIENTE' || f.estado_sri === 'EN PROCESO').length;
        return {
            total_facturado_mes: totalFacturadoMes,
            iva_por_pagar: ivaPorPagar,
            comprobantes_rechazados: comprobantesRechazados,
            comprobantes_autorizados: comprobantesAutorizados,
            comprobantes_pendientes: comprobantesPendientes,
            total_facturas: facturasMes.length,
        };
    }
    async buscarFacturas(filtros) {
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
    async findOne(id) {
        const factura = await this.facturaRepository.findOne({
            where: { id },
            relations: ['cliente', 'detalles', 'detalles.producto'],
        });
        if (!factura) {
            throw new common_1.NotFoundException(`Factura con ID ${id} no encontrada`);
        }
        return factura;
    }
    async validarStock(detalles) {
        const productosIds = detalles.map((d) => d.producto_id);
        const productos = await this.productoRepository.find({
            where: { id: (0, typeorm_2.In)(productosIds) },
        });
        const productosMap = new Map(productos.map((p) => [p.id, p]));
        const errores = [];
        for (const detalle of detalles) {
            const producto = productosMap.get(detalle.producto_id);
            if (!producto) {
                errores.push(`Producto ID ${detalle.producto_id} no encontrado`);
            }
            else if (producto.stock < detalle.cantidad) {
                errores.push(`${producto.nombre}: Stock insuficiente (disponible: ${producto.stock}, solicitado: ${detalle.cantidad})`);
            }
        }
        if (errores.length > 0) {
            throw new common_1.BadRequestException({
                error: 'Stock insuficiente',
                detalles: errores,
            });
        }
    }
    async updateEstado(id, estado) {
        const factura = await this.findOne(id);
        factura.estado = estado;
        const saved = await this.facturaRepository.save(factura);
        this.eventsGateway.emitFacturaActualizada(saved);
        return saved;
    }
    async anular(id) {
        const factura = await this.findOne(id);
        if (!factura)
            throw new common_1.NotFoundException('Factura no encontrada');
        if (factura.estado === 'ANULADA') {
            throw new common_1.BadRequestException('La factura ya está anulada');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.update(factura_entity_1.Factura, id, { estado: 'ANULADA' });
            for (const detalle of factura.detalles || []) {
                await this.inventarioService.registrarMovimientoConActualizacion({
                    producto_id: detalle.producto_id,
                    tipo: 'ENTRADA',
                    cantidad: detalle.cantidad,
                    motivo: `Anulación de Factura ${factura.numero}`,
                }, queryRunner);
            }
            try {
                await this.contabilidadService.anularAsientoFactura(factura, { queryRunner });
            }
            catch (error) {
                console.error(`Error al anular siento contable: ${error.message}`);
                throw new Error(`Error revirtiendo contabilidad: ${error.message}`);
            }
            await queryRunner.commitTransaction();
            return { success: true, message: `Factura ${factura.numero} anulada correctamente` };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new common_1.BadRequestException(`Error anulando factura: ${error.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.FacturasService = FacturasService;
exports.FacturasService = FacturasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, typeorm_1.InjectRepository)(factura_detalle_entity_1.FacturaDetalle)),
    __param(2, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => events_gateway_1.EventsGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        sri_service_1.SriService,
        inventario_service_1.InventarioService,
        contabilidad_service_1.ContabilidadService,
        empresa_service_1.EmpresaService,
        events_gateway_1.EventsGateway])
], FacturasService);
//# sourceMappingURL=facturas.service.js.map