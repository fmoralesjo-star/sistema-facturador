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
exports.ValoracionInventarioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lote_inventario_entity_1 = require("./entities/lote-inventario.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
let ValoracionInventarioService = class ValoracionInventarioService {
    constructor(loteRepository, productoRepository) {
        this.loteRepository = loteRepository;
        this.productoRepository = productoRepository;
    }
    async registrarLote(data) {
        const lote = this.loteRepository.create({
            producto_id: data.producto_id,
            numero_lote: data.numero_lote,
            fecha_entrada: new Date(data.fecha_entrada),
            fecha_vencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : null,
            cantidad_inicial: data.cantidad,
            cantidad_disponible: data.cantidad,
            costo_unitario: data.costo_unitario,
            precio_venta: data.precio_venta,
            proveedor: data.proveedor,
            referencia_compra: data.referencia_compra,
        });
        const loteGuardado = await this.loteRepository.save(lote);
        await this.actualizarCostoPromedio(data.producto_id);
        return loteGuardado;
    }
    async aplicarSalidaFIFO(productoId, cantidad) {
        const lotes = await this.loteRepository.find({
            where: { producto_id: productoId },
            order: { fecha_entrada: 'ASC', id: 'ASC' },
        });
        const lotesUtilizados = [];
        let cantidadRestante = cantidad;
        let costoTotal = 0;
        for (const lote of lotes) {
            if (cantidadRestante <= 0)
                break;
            if (lote.cantidad_disponible > 0) {
                const cantidadUsar = Math.min(cantidadRestante, lote.cantidad_disponible);
                lote.cantidad_disponible -= cantidadUsar;
                await this.loteRepository.save(lote);
                lotesUtilizados.push({
                    lote_id: lote.id,
                    cantidad: cantidadUsar,
                    costo_unitario: lote.costo_unitario,
                });
                costoTotal += cantidadUsar * lote.costo_unitario;
                cantidadRestante -= cantidadUsar;
            }
        }
        await this.actualizarCostoPromedio(productoId);
        return {
            lotes_utilizados: lotesUtilizados,
            costo_total: costoTotal,
            cantidad_atendida: cantidad - cantidadRestante,
            cantidad_faltante: cantidadRestante,
        };
    }
    async calcularValoracionFIFO(productoId) {
        const lotes = await this.loteRepository.find({
            where: { producto_id: productoId },
            order: { fecha_entrada: 'ASC' },
        });
        let valoracionTotal = 0;
        let cantidadTotal = 0;
        for (const lote of lotes) {
            if (lote.cantidad_disponible > 0) {
                valoracionTotal += lote.cantidad_disponible * lote.costo_unitario;
                cantidadTotal += lote.cantidad_disponible;
            }
        }
        const costoPromedio = cantidadTotal > 0 ? valoracionTotal / cantidadTotal : 0;
        return {
            producto_id: productoId,
            cantidad_total: cantidadTotal,
            valoracion_total: valoracionTotal,
            costo_promedio: costoPromedio,
            lotes_activos: lotes.filter(l => l.cantidad_disponible > 0).length,
        };
    }
    async actualizarCostoPromedio(productoId) {
        const valoracion = await this.calcularValoracionFIFO(productoId);
        const producto = await this.productoRepository.findOne({
            where: { id: productoId },
        });
        if (producto) {
            producto.costo_promedio = valoracion.costo_promedio;
            await this.productoRepository.save(producto);
        }
        return valoracion.costo_promedio;
    }
    async obtenerLotesDisponibles(productoId) {
        return this.loteRepository.find({
            where: { producto_id: productoId },
            order: { fecha_entrada: 'ASC', id: 'ASC' },
        });
    }
    async obtenerValoracionTotalInventario() {
        const productos = await this.productoRepository.find();
        let valoracionTotal = 0;
        const valoraciones = [];
        for (const producto of productos) {
            const valoracion = await this.calcularValoracionFIFO(producto.id);
            valoracionTotal += valoracion.valoracion_total;
            valoraciones.push({
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                producto_codigo: producto.codigo,
                ...valoracion,
            });
        }
        return {
            valoracion_total: valoracionTotal,
            productos: valoraciones,
        };
    }
};
exports.ValoracionInventarioService = ValoracionInventarioService;
exports.ValoracionInventarioService = ValoracionInventarioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lote_inventario_entity_1.LoteInventario)),
    __param(1, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ValoracionInventarioService);
//# sourceMappingURL=valoracion-inventario.service.js.map