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
exports.InventarioController = void 0;
const common_1 = require("@nestjs/common");
const inventario_service_1 = require("./inventario.service");
let InventarioController = class InventarioController {
    constructor(inventarioService) {
        this.inventarioService = inventarioService;
    }
    async getInventario() {
        return this.inventarioService.obtenerInventario();
    }
    async getMovimientos() {
        return this.inventarioService.obtenerMovimientos();
    }
    async getEstadisticas() {
        return this.inventarioService.obtenerEstadisticas();
    }
    async getStockBajo(limite) {
        const limiteNum = limite ? parseInt(limite, 10) : 10;
        return this.inventarioService.obtenerStockBajo(limiteNum);
    }
    async getKardex(productoId, puntoVentaId) {
        const puntoVentaIdNum = puntoVentaId ? parseInt(puntoVentaId) : undefined;
        return this.inventarioService.obtenerKardex(productoId, puntoVentaIdNum);
    }
    async getAlertas() {
        return this.inventarioService.obtenerAlertas();
    }
    async getResumenAlertas() {
        return this.inventarioService.obtenerResumenAlertas();
    }
    async getProductosReorden() {
        return this.inventarioService.obtenerProductosReorden();
    }
    async getValoracion() {
        return this.inventarioService.obtenerValoracionTotalInventario();
    }
    async createMovimiento(dto) {
        const tipoNormalizado = (dto.tipo?.toUpperCase() || 'ENTRADA');
        const movimientoDto = {
            producto_id: dto.producto_id,
            tipo: tipoNormalizado,
            cantidad: dto.cantidad,
            motivo: dto.motivo,
            observaciones: dto.motivo,
            fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
            punto_venta_id: dto.punto_venta_id,
        };
        if (dto.punto_venta_id) {
            await this.inventarioService.actualizarStockPuntoVenta(dto.producto_id, dto.punto_venta_id, dto.cantidad, tipoNormalizado);
        }
        return this.inventarioService.registrarMovimientoConActualizacion(movimientoDto);
    }
    async getInventarioPorPuntoVenta(puntoVentaId) {
        return this.inventarioService.obtenerInventarioPorPuntoVenta(puntoVentaId);
    }
    async transferirStock(dto) {
        return this.inventarioService.transferirStock(dto.producto_id, dto.punto_venta_origen, dto.punto_venta_destino, dto.cantidad);
    }
    async ajusteMasivo(dto) {
        const resultados = [];
        const fecha = dto.fecha ? new Date(dto.fecha) : new Date();
        for (const ajuste of dto.ajustes) {
            try {
                const diferencia = ajuste.cantidad_fisica - ajuste.stock_sistema;
                if (diferencia !== 0) {
                    const tipo = diferencia > 0 ? 'ENTRADA' : 'SALIDA';
                    const cantidad = Math.abs(diferencia);
                    const movimientoDto = {
                        producto_id: ajuste.producto_id,
                        tipo: 'AJUSTE',
                        cantidad: cantidad,
                        motivo: dto.motivo || `Toma Física: ${diferencia > 0 ? 'Sobrante' : 'Faltante'} detectado`,
                        observaciones: `Stock Sistema: ${ajuste.stock_sistema} | Conteo Físico: ${ajuste.cantidad_fisica}`,
                        fecha: fecha,
                        punto_venta_id: dto.punto_venta_id
                    };
                    if (dto.punto_venta_id) {
                        await this.inventarioService.actualizarStockPuntoVenta(ajuste.producto_id, dto.punto_venta_id, ajuste.cantidad_fisica, 'AJUSTE');
                    }
                    await this.inventarioService.registrarMovimientoConActualizacion(movimientoDto);
                    resultados.push({
                        producto_id: ajuste.producto_id,
                        estado: 'OK',
                        diferencia: diferencia
                    });
                }
            }
            catch (error) {
                console.error(`Error ajustando producto ${ajuste.producto_id}:`, error);
                resultados.push({
                    producto_id: ajuste.producto_id,
                    estado: 'ERROR',
                    error: error.message
                });
            }
        }
        return { procesados: resultados.length, detalles: resultados };
    }
    async transferenciaMasiva(dto) {
        const resultados = [];
        const fecha = dto.fecha ? new Date(dto.fecha) : new Date();
        for (const transfer of dto.transferencias) {
            try {
                await this.inventarioService.transferirStock(transfer.producto_id, dto.punto_venta_origen, dto.punto_venta_destino, transfer.cantidad);
                resultados.push({
                    producto_id: transfer.producto_id,
                    estado: 'OK',
                    cantidad: transfer.cantidad
                });
            }
            catch (error) {
                console.error(`Error transfiriendo producto ${transfer.producto_id}:`, error);
                resultados.push({
                    producto_id: transfer.producto_id,
                    estado: 'ERROR',
                    error: error.message
                });
            }
        }
        return {
            procesados: resultados.filter(r => r.estado === 'OK').length,
            fallidos: resultados.filter(r => r.estado === 'ERROR').length,
            detalles: resultados
        };
    }
};
exports.InventarioController = InventarioController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getInventario", null);
__decorate([
    (0, common_1.Get)('movimientos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getMovimientos", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getEstadisticas", null);
__decorate([
    (0, common_1.Get)('stock-bajo'),
    __param(0, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getStockBajo", null);
__decorate([
    (0, common_1.Get)('kardex/:producto_id'),
    __param(0, (0, common_1.Param)('producto_id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('punto_venta_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getKardex", null);
__decorate([
    (0, common_1.Get)('alertas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getAlertas", null);
__decorate([
    (0, common_1.Get)('alertas/resumen'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getResumenAlertas", null);
__decorate([
    (0, common_1.Get)('productos-reorden'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getProductosReorden", null);
__decorate([
    (0, common_1.Get)('valoracion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getValoracion", null);
__decorate([
    (0, common_1.Post)('movimientos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "createMovimiento", null);
__decorate([
    (0, common_1.Get)('punto-venta/:puntoVentaId'),
    __param(0, (0, common_1.Param)('puntoVentaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "getInventarioPorPuntoVenta", null);
__decorate([
    (0, common_1.Post)('transferencia'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "transferirStock", null);
__decorate([
    (0, common_1.Post)('ajuste-masivo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "ajusteMasivo", null);
__decorate([
    (0, common_1.Post)('transferencia-masiva'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "transferenciaMasiva", null);
exports.InventarioController = InventarioController = __decorate([
    (0, common_1.Controller)('inventario'),
    __metadata("design:paramtypes", [inventario_service_1.InventarioService])
], InventarioController);
//# sourceMappingURL=inventario.controller.js.map