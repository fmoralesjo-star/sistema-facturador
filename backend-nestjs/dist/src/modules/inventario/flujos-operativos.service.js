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
exports.FlujosOperativosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const orden_compra_entity_1 = require("./entities/orden-compra.entity");
const orden_compra_detalle_entity_1 = require("./entities/orden-compra-detalle.entity");
const albaran_entity_1 = require("./entities/albaran.entity");
const albaran_detalle_entity_1 = require("./entities/albaran-detalle.entity");
const transferencia_entity_1 = require("./entities/transferencia.entity");
const transferencia_detalle_entity_1 = require("./entities/transferencia-detalle.entity");
const ajuste_inventario_entity_1 = require("./entities/ajuste-inventario.entity");
const picking_entity_1 = require("./entities/picking.entity");
const picking_detalle_entity_1 = require("./entities/picking-detalle.entity");
const conteo_ciclico_entity_1 = require("./entities/conteo-ciclico.entity");
const conteo_ciclico_detalle_entity_1 = require("./entities/conteo-ciclico-detalle.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const common_2 = require("@nestjs/common");
const inventario_service_1 = require("./inventario.service");
let FlujosOperativosService = class FlujosOperativosService {
    constructor(ordenCompraRepository, ordenCompraDetalleRepository, albaranRepository, albaranDetalleRepository, transferenciaRepository, transferenciaDetalleRepository, ajusteInventarioRepository, pickingRepository, pickingDetalleRepository, conteoCiclicoRepository, conteoCiclicoDetalleRepository, productoRepository, inventarioService) {
        this.ordenCompraRepository = ordenCompraRepository;
        this.ordenCompraDetalleRepository = ordenCompraDetalleRepository;
        this.albaranRepository = albaranRepository;
        this.albaranDetalleRepository = albaranDetalleRepository;
        this.transferenciaRepository = transferenciaRepository;
        this.transferenciaDetalleRepository = transferenciaDetalleRepository;
        this.ajusteInventarioRepository = ajusteInventarioRepository;
        this.pickingRepository = pickingRepository;
        this.pickingDetalleRepository = pickingDetalleRepository;
        this.conteoCiclicoRepository = conteoCiclicoRepository;
        this.conteoCiclicoDetalleRepository = conteoCiclicoDetalleRepository;
        this.productoRepository = productoRepository;
        this.inventarioService = inventarioService;
    }
    async crearOrdenCompra(data) {
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
            const detalles = data.detalles.map((det) => this.ordenCompraDetalleRepository.create({
                orden_compra_id: ordenGuardada.id,
                producto_id: det.producto_id,
                cantidad_pedida: det.cantidad_pedida,
                precio_unitario: det.precio_unitario,
            }));
            await this.ordenCompraDetalleRepository.save(detalles);
        }
        return this.ordenCompraRepository.findOne({
            where: { id: ordenGuardada.id },
            relations: ['detalles', 'detalles.producto'],
        });
    }
    async crearAlbaran(data) {
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
            const detalles = await Promise.all(data.detalles.map(async (det) => {
                const cantidadFaltante = Math.max(0, det.cantidad_esperada - det.cantidad_recibida);
                const estado = cantidadFaltante > 0 || det.cantidad_danada > 0 ? 'DISCREPANCIA' : 'OK';
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
            }));
            await this.albaranDetalleRepository.save(detalles);
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
        const albaranCompleto = await this.albaranRepository.findOne({
            where: { id: albaranGuardado.id },
            relations: ['detalles'],
        });
        const tieneDiscrepancias = albaranCompleto.detalles.some((d) => d.estado === 'DISCREPANCIA');
        albaranCompleto.estado = tieneDiscrepancias ? 'CON_DISCREPANCIAS' : 'CONCILIADO';
        await this.albaranRepository.save(albaranCompleto);
        return this.albaranRepository.findOne({
            where: { id: albaranGuardado.id },
            relations: ['detalles', 'detalles.producto', 'orden_compra'],
        });
    }
    async crearTransferencia(data) {
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
            const detalles = data.detalles.map((det) => this.transferenciaDetalleRepository.create({
                transferencia_id: transferenciaGuardada.id,
                producto_id: det.producto_id,
                cantidad: det.cantidad,
            }));
            await this.transferenciaDetalleRepository.save(detalles);
        }
        return this.transferenciaRepository.findOne({
            where: { id: transferenciaGuardada.id },
            relations: ['detalles', 'detalles.producto'],
        });
    }
    async registrarAjuste(data) {
        const producto = await this.productoRepository.findOne({
            where: { id: data.producto_id },
        });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con ID ${data.producto_id} no encontrado`);
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
        producto.stock = data.cantidad_nueva;
        await this.productoRepository.save(producto);
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
    async crearPicking(data) {
        const picking = this.pickingRepository.create({
            numero: data.numero || `PICK-${Date.now()}`,
            fecha: new Date(data.fecha),
            orden_venta: data.orden_venta,
            estado: 'PENDIENTE',
            operario: data.operario,
        });
        const pickingGuardado = await this.pickingRepository.save(picking);
        if (data.detalles && data.detalles.length > 0) {
            const detalles = data.detalles.map((det, index) => this.pickingDetalleRepository.create({
                picking_id: pickingGuardado.id,
                producto_id: det.producto_id,
                ubicacion_id: det.ubicacion_id,
                cantidad_solicitada: det.cantidad_solicitada,
                orden_picking: det.orden_picking || index + 1,
            }));
            await this.pickingDetalleRepository.save(detalles);
        }
        return this.pickingRepository.findOne({
            where: { id: pickingGuardado.id },
            relations: ['detalles', 'detalles.producto', 'detalles.ubicacion'],
        });
    }
    async crearConteoCiclico(data) {
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
            const detalles = await Promise.all(data.detalles.map(async (det) => {
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
            }));
            await this.conteoCiclicoDetalleRepository.save(detalles);
        }
        return this.conteoCiclicoRepository.findOne({
            where: { id: conteoGuardado.id },
            relations: ['detalles', 'detalles.producto'],
        });
    }
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
};
exports.FlujosOperativosService = FlujosOperativosService;
exports.FlujosOperativosService = FlujosOperativosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orden_compra_entity_1.OrdenCompra)),
    __param(1, (0, typeorm_1.InjectRepository)(orden_compra_detalle_entity_1.OrdenCompraDetalle)),
    __param(2, (0, typeorm_1.InjectRepository)(albaran_entity_1.Albaran)),
    __param(3, (0, typeorm_1.InjectRepository)(albaran_detalle_entity_1.AlbaranDetalle)),
    __param(4, (0, typeorm_1.InjectRepository)(transferencia_entity_1.Transferencia)),
    __param(5, (0, typeorm_1.InjectRepository)(transferencia_detalle_entity_1.TransferenciaDetalle)),
    __param(6, (0, typeorm_1.InjectRepository)(ajuste_inventario_entity_1.AjusteInventario)),
    __param(7, (0, typeorm_1.InjectRepository)(picking_entity_1.Picking)),
    __param(8, (0, typeorm_1.InjectRepository)(picking_detalle_entity_1.PickingDetalle)),
    __param(9, (0, typeorm_1.InjectRepository)(conteo_ciclico_entity_1.ConteoCiclico)),
    __param(10, (0, typeorm_1.InjectRepository)(conteo_ciclico_detalle_entity_1.ConteoCiclicoDetalle)),
    __param(11, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(12, (0, common_2.Inject)((0, common_2.forwardRef)(() => inventario_service_1.InventarioService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        inventario_service_1.InventarioService])
], FlujosOperativosService);
//# sourceMappingURL=flujos-operativos.service.js.map