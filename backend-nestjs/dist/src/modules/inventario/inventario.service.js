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
exports.InventarioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const movimiento_inventario_entity_1 = require("./entities/movimiento-inventario.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const producto_ubicacion_entity_1 = require("./entities/producto-ubicacion.entity");
const producto_punto_venta_entity_1 = require("./entities/producto-punto-venta.entity");
const alertas_inventario_service_1 = require("./alertas-inventario.service");
const valoracion_inventario_service_1 = require("./valoracion-inventario.service");
const contabilidad_service_1 = require("../contabilidad/contabilidad.service");
const events_gateway_1 = require("../../gateways/events.gateway");
let InventarioService = class InventarioService {
    constructor(movimientoRepository, productoRepository, productoUbicacionRepository, productoPuntoVentaRepository, alertasService, valoracionService, contabilidadService, eventsGateway) {
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
        this.productoUbicacionRepository = productoUbicacionRepository;
        this.productoPuntoVentaRepository = productoPuntoVentaRepository;
        this.alertasService = alertasService;
        this.valoracionService = valoracionService;
        this.contabilidadService = contabilidadService;
        this.eventsGateway = eventsGateway;
    }
    async registrarMovimiento(dto, queryRunner) {
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
    async registrarMovimientoConActualizacion(dto, queryRunner) {
        let producto;
        if (queryRunner) {
            producto = await queryRunner.manager.findOne(producto_entity_1.Producto, { where: { id: dto.producto_id } });
        }
        else {
            producto = await this.productoRepository.findOne({ where: { id: dto.producto_id } });
        }
        if (!producto) {
            throw new Error('Producto no encontrado');
        }
        const stockAnterior = producto.stock || 0;
        let nuevoStock = stockAnterior;
        if (dto.tipo === 'ENTRADA') {
            nuevoStock = stockAnterior + dto.cantidad;
        }
        else if (dto.tipo === 'SALIDA') {
            nuevoStock = Math.max(0, stockAnterior - dto.cantidad);
        }
        else if (dto.tipo === 'AJUSTE') {
            nuevoStock = dto.cantidad;
        }
        const movimiento = await this.registrarMovimiento({
            ...dto,
            fecha: dto.fecha || new Date(),
        }, queryRunner);
        if (queryRunner) {
            await queryRunner.manager.update(producto_entity_1.Producto, { id: dto.producto_id }, { stock: nuevoStock });
        }
        else {
            await this.productoRepository.update({ id: dto.producto_id }, { stock: nuevoStock });
        }
        if (dto.tipo === 'AJUSTE' || (!dto.factura_id && !dto.compra_id)) {
            try {
                await this.contabilidadService.crearAsientoAjusteInventario({
                    producto: producto,
                    cantidad: dto.tipo === 'AJUSTE' ? (nuevoStock - stockAnterior) : (dto.tipo === 'ENTRADA' ? dto.cantidad : -dto.cantidad),
                    tipo: dto.tipo,
                    motivo: dto.motivo || 'Ajuste manual de inventario',
                    valorUnitario: Number(producto.precio) || 0,
                });
            }
            catch (error) {
                console.error('Error al crear asiento contable para ajuste de inventario:', error);
            }
        }
        if (nuevoStock <= (producto.punto_reorden || 0) && this.eventsGateway) {
            this.eventsGateway.emitStockBajo({
                id: producto.id,
                nombre: producto.nombre,
                stock: nuevoStock,
                punto_reorden: producto.punto_reorden,
            });
        }
        return {
            ...movimiento,
            stock_anterior: stockAnterior,
            stock_nuevo: nuevoStock,
        };
    }
    async obtenerKardex(productoId, puntoVentaId) {
        const producto = await this.productoRepository.findOne({
            where: { id: productoId },
        });
        if (!producto) {
            throw new Error('Producto no encontrado');
        }
        const whereConditions = { producto_id: productoId };
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
            }
            else if (mov.tipo === 'SALIDA') {
                stockActual -= mov.cantidad;
            }
            else if (mov.tipo === 'AJUSTE') {
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
        const productosConUbicaciones = await Promise.all(productos.map(async (producto) => {
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
                desglose_stock: desglose_stock,
                total_ubicaciones: ubicaciones.length,
            };
        }));
        return productosConUbicaciones;
    }
    async obtenerMovimientos() {
        const movimientos = await this.movimientoRepository.find({
            relations: ['producto', 'factura'],
            order: { fecha: 'DESC', id: 'DESC' },
            take: 100,
        });
        return movimientos.map((mov) => {
            let stockAnterior = 0;
            let stockNuevo = 0;
            if (mov.producto) {
                const stockActual = mov.producto.stock || 0;
                if (mov.tipo === 'ENTRADA') {
                    stockNuevo = stockActual;
                    stockAnterior = stockActual - mov.cantidad;
                }
                else if (mov.tipo === 'SALIDA') {
                    stockNuevo = stockActual;
                    stockAnterior = stockActual + mov.cantidad;
                }
                else if (mov.tipo === 'AJUSTE') {
                    stockNuevo = mov.cantidad;
                    stockAnterior = stockActual;
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
                usuario: mov.usuario || 'Sistema',
            };
        });
    }
    async obtenerEstadisticas() {
        const productos = await this.productoRepository.find();
        const total_productos = productos.length;
        const stock_total = productos.reduce((sum, p) => sum + (p.stock || 0), 0);
        const productos_stock_bajo = productos.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.punto_reorden || 10)).length;
        const productos_sin_stock = productos.filter((p) => (p.stock || 0) === 0).length;
        let valor_total = 0;
        productos.forEach((p) => {
            const stock = p.stock || 0;
            const precio_costo = parseFloat(p.precio_costo?.toString() || '0') || 0;
            valor_total += stock * precio_costo;
        });
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
                if (mov.factura_id && mov.factura) {
                    if (mov.factura.total) {
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
    async obtenerStockBajo(limite = 10) {
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
    async obtenerInventarioPorPuntoVenta(puntoVentaId) {
        const productos = await this.productoRepository.find({
            order: { nombre: 'ASC' },
        });
        const productosConStock = await Promise.all(productos.map(async (producto) => {
            let stockPuntoVenta = await this.productoPuntoVentaRepository.findOne({
                where: { producto_id: producto.id, punto_venta_id: puntoVentaId },
            });
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
        }));
        return productosConStock;
    }
    async actualizarStockPuntoVenta(productoId, puntoVentaId, cantidad, tipo, queryRunner) {
        let stockPuntoVenta;
        if (queryRunner) {
            stockPuntoVenta = await queryRunner.manager.findOne(producto_punto_venta_entity_1.ProductoPuntoVenta, {
                where: { producto_id: productoId, punto_venta_id: puntoVentaId },
            });
        }
        else {
            stockPuntoVenta = await this.productoPuntoVentaRepository.findOne({
                where: { producto_id: productoId, punto_venta_id: puntoVentaId },
            });
        }
        if (!stockPuntoVenta) {
            if (queryRunner) {
                stockPuntoVenta = queryRunner.manager.create(producto_punto_venta_entity_1.ProductoPuntoVenta, {
                    producto_id: productoId,
                    punto_venta_id: puntoVentaId,
                    stock: 0,
                });
            }
            else {
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
        }
        else if (tipo === 'SALIDA') {
            nuevoStock = Math.max(0, stockAnterior - cantidad);
        }
        else if (tipo === 'AJUSTE') {
            nuevoStock = cantidad;
        }
        stockPuntoVenta.stock = nuevoStock;
        if (queryRunner) {
            await queryRunner.manager.save(stockPuntoVenta);
        }
        else {
            await this.productoPuntoVentaRepository.save(stockPuntoVenta);
        }
        if (this.eventsGateway) {
            this.eventsGateway.emitInventarioActualizado();
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
    async transferirStock(productoId, puntoVentaOrigen, puntoVentaDestino, cantidad) {
        const stockOrigen = await this.productoPuntoVentaRepository.findOne({
            where: { producto_id: productoId, punto_venta_id: puntoVentaOrigen },
        });
        if (!stockOrigen || stockOrigen.stock < cantidad) {
            throw new Error('Stock insuficiente en el punto de venta origen');
        }
        await this.actualizarStockPuntoVenta(productoId, puntoVentaOrigen, cantidad, 'SALIDA');
        await this.actualizarStockPuntoVenta(productoId, puntoVentaDestino, cantidad, 'ENTRADA');
        await this.registrarMovimiento({
            producto_id: productoId,
            tipo: 'SALIDA',
            cantidad: cantidad,
            motivo: `Transferencia a Punto de Venta ${puntoVentaDestino}`,
            observaciones: `Transferencia entre puntos de venta`,
            punto_venta_id: puntoVentaOrigen,
        });
        await this.registrarMovimiento({
            producto_id: productoId,
            tipo: 'ENTRADA',
            cantidad: cantidad,
            motivo: `Transferencia desde Punto de Venta ${puntoVentaOrigen}`,
            observaciones: `Transferencia entre puntos de venta`,
            punto_venta_id: puntoVentaDestino,
        });
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
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(movimiento_inventario_entity_1.MovimientoInventario)),
    __param(1, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(2, (0, typeorm_1.InjectRepository)(producto_ubicacion_entity_1.ProductoUbicacion)),
    __param(3, (0, typeorm_1.InjectRepository)(producto_punto_venta_entity_1.ProductoPuntoVenta)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => alertas_inventario_service_1.AlertasInventarioService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => valoracion_inventario_service_1.ValoracionInventarioService))),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => contabilidad_service_1.ContabilidadService))),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => events_gateway_1.EventsGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        alertas_inventario_service_1.AlertasInventarioService,
        valoracion_inventario_service_1.ValoracionInventarioService,
        contabilidad_service_1.ContabilidadService,
        events_gateway_1.EventsGateway])
], InventarioService);
//# sourceMappingURL=inventario.service.js.map