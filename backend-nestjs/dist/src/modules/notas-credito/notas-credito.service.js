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
exports.NotasCreditoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const nota_credito_entity_1 = require("./entities/nota-credito.entity");
const facturas_service_1 = require("../facturas/facturas.service");
const inventario_service_1 = require("../inventario/inventario.service");
const contabilidad_service_1 = require("../contabilidad/contabilidad.service");
const sri_service_1 = require("../sri/sri.service");
const configuracion_entity_1 = require("../admin/entities/configuracion.entity");
let NotasCreditoService = class NotasCreditoService {
    constructor(notaCreditoRepository, detalleRepository, configuracionRepository, facturasService, inventarioService, contabilidadService, sriService, dataSource) {
        this.notaCreditoRepository = notaCreditoRepository;
        this.detalleRepository = detalleRepository;
        this.configuracionRepository = configuracionRepository;
        this.facturasService = facturasService;
        this.inventarioService = inventarioService;
        this.contabilidadService = contabilidadService;
        this.sriService = sriService;
        this.dataSource = dataSource;
    }
    async create(createDto) {
        return await this.dataSource.transaction(async (manager) => {
            const factura = await this.facturasService.findOne(createDto.factura_id);
            if (!factura)
                throw new common_1.NotFoundException('Factura no encontrada');
            const prefix = factura.numero.split('-').slice(0, 2).join('-');
            const nc = manager.create(nota_credito_entity_1.NotaCredito, {
                numero: `${prefix}-${Date.now().toString().slice(-9)}`,
                fecha: new Date(),
                factura_id: factura.id,
                cliente_id: factura.cliente_id,
                motivo: createDto.motivo,
                subtotal: 0,
                impuesto: 0,
                total: 0,
                estado: 'EMITIDO',
            });
            const ncGuardada = await manager.save(nc);
            let subtotalNC = 0;
            let impuestoNC = 0;
            const detallesOriginales = factura.detalles || [];
            const detallesAProcesar = createDto.detalles || detallesOriginales.map(d => ({
                producto_id: d.producto_id,
                cantidad: d.cantidad
            }));
            const detallesFinales = [];
            for (const item of detallesAProcesar) {
                const detalleOrig = detallesOriginales.find(d => d.producto_id === item.producto_id);
                if (!detalleOrig)
                    continue;
                const cantidad = Math.min(item.cantidad, detalleOrig.cantidad);
                const subtotal = cantidad * Number(detalleOrig.precio_unitario);
                const configIva = await manager.findOne(configuracion_entity_1.Configuracion, { where: { clave: 'impuesto_iva_porcentaje' } });
                const porcentajeIva = configIva ? parseFloat(configIva.valor) / 100 : 0.15;
                const impuesto = subtotal * porcentajeIva;
                const ncDetalle = manager.create(nota_credito_entity_1.NotaCreditoDetalle, {
                    nota_credito_id: ncGuardada.id,
                    producto_id: item.producto_id,
                    cantidad: cantidad,
                    precio_unitario: Number(detalleOrig.precio_unitario),
                    subtotal: subtotal,
                });
                const savedDetalle = await manager.save(ncDetalle);
                detallesFinales.push(savedDetalle);
                subtotalNC += subtotal;
                impuestoNC += impuesto;
                try {
                    await this.inventarioService.registrarMovimientoConActualizacion({
                        producto_id: item.producto_id,
                        tipo: 'ENTRADA',
                        cantidad: cantidad,
                        motivo: `Devolución por NC ${ncGuardada.numero}`,
                    });
                }
                catch (error) {
                    console.error(`Error al revertir stock para producto ${item.producto_id}:`, error);
                }
            }
            ncGuardada.subtotal = subtotalNC;
            ncGuardada.impuesto = impuestoNC;
            ncGuardada.total = subtotalNC + impuestoNC;
            ncGuardada.detalles = detallesFinales;
            await manager.save(ncGuardada);
            try {
                await this.contabilidadService.crearAsientoNotaCredito({
                    notaCredito: ncGuardada,
                    factura: factura,
                    queryRunner: { manager },
                });
            }
            catch (error) {
                console.error('Error al crear asiento contable para NC:', error);
            }
            this.procesarSRIEnFondo(ncGuardada.id);
            return ncGuardada;
        });
    }
    async procesarSRIEnFondo(ncId) {
        try {
            const nc = await this.findOne(ncId);
            const xml = await this.sriService.generarXMLNotaCredito(nc);
            console.log(`[SRI] XML generado para NC ${nc.numero}, listo para envío.`);
        }
        catch (error) {
            console.error(`Error en procesamiento SRI para NC ${ncId}:`, error);
        }
    }
    async findAll() {
        return this.notaCreditoRepository.find({ relations: ['factura', 'cliente'] });
    }
    async findOne(id) {
        const nc = await this.notaCreditoRepository.findOne({
            where: { id },
            relations: ['factura', 'cliente', 'detalles'],
        });
        if (!nc)
            throw new common_1.NotFoundException('Nota de Crédito no encontrada');
        return nc;
    }
};
exports.NotasCreditoService = NotasCreditoService;
exports.NotasCreditoService = NotasCreditoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(nota_credito_entity_1.NotaCredito)),
    __param(1, (0, typeorm_1.InjectRepository)(nota_credito_entity_1.NotaCreditoDetalle)),
    __param(2, (0, typeorm_1.InjectRepository)(configuracion_entity_1.Configuracion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        facturas_service_1.FacturasService,
        inventario_service_1.InventarioService,
        contabilidad_service_1.ContabilidadService,
        sri_service_1.SriService,
        typeorm_2.DataSource])
], NotasCreditoService);
//# sourceMappingURL=notas-credito.service.js.map