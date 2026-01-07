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
exports.AlertasInventarioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const producto_entity_1 = require("../productos/entities/producto.entity");
let AlertasInventarioService = class AlertasInventarioService {
    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }
    calcularPuntoReordenSugerido(demandaPromedioDiaria, tiempoEntregaDias, stockSeguridad = 0) {
        return Math.ceil(demandaPromedioDiaria * tiempoEntregaDias) + stockSeguridad;
    }
    async obtenerAlertas() {
        const productos = await this.productoRepository.find({
            where: { activo: true },
        });
        const alertas = [];
        for (const producto of productos) {
            const alertasProducto = this.evaluarAlertasProducto(producto);
            alertas.push(...alertasProducto);
        }
        const ordenSeveridad = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
        alertas.sort((a, b) => ordenSeveridad[b.severidad] - ordenSeveridad[a.severidad]);
        return alertas;
    }
    evaluarAlertasProducto(producto) {
        const alertas = [];
        const stock = producto.stock || 0;
        if (stock <= 0) {
            alertas.push({
                tipo: 'STOCK_CRITICO',
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                producto_codigo: producto.codigo,
                sku: producto.sku,
                stock_actual: stock,
                mensaje: `Stock crítico: ${stock} unidades. Producto sin stock disponible.`,
                severidad: 'CRITICA',
            });
        }
        if (producto.punto_reorden && stock <= producto.punto_reorden) {
            const diferencia = producto.punto_reorden - stock;
            const severidad = stock === 0 ? 'CRITICA' : stock <= producto.punto_reorden * 0.5 ? 'ALTA' : 'MEDIA';
            alertas.push({
                tipo: 'PUNTO_REORDEN',
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                producto_codigo: producto.codigo,
                sku: producto.sku,
                stock_actual: stock,
                punto_reorden: producto.punto_reorden,
                mensaje: `Punto de reorden alcanzado: ${stock} unidades (umbral: ${producto.punto_reorden}). ${diferencia > 0 ? `Faltan ${diferencia} unidades para alcanzar el punto de reorden.` : 'Es momento de reordenar.'}`,
                severidad: severidad,
            });
        }
        if (producto.stock_seguridad && stock <= producto.stock_seguridad) {
            const diferencia = producto.stock_seguridad - stock;
            const severidad = stock === 0 ? 'CRITICA' : 'ALTA';
            alertas.push({
                tipo: 'STOCK_SEGURIDAD',
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                producto_codigo: producto.codigo,
                sku: producto.sku,
                stock_actual: stock,
                stock_seguridad: producto.stock_seguridad,
                mensaje: `Stock de seguridad alcanzado: ${stock} unidades (mínimo: ${producto.stock_seguridad}). ${diferencia > 0 ? `Faltan ${diferencia} unidades para alcanzar el stock de seguridad.` : 'Riesgo de quiebre de stock.'}`,
                severidad: severidad,
            });
        }
        if (!producto.punto_reorden && stock > 0 && stock < 10) {
            alertas.push({
                tipo: 'STOCK_BAJO',
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                producto_codigo: producto.codigo,
                sku: producto.sku,
                stock_actual: stock,
                mensaje: `Stock bajo: ${stock} unidades. Considera configurar punto de reorden.`,
                severidad: 'BAJA',
            });
        }
        return alertas;
    }
    async obtenerResumenAlertas() {
        const alertas = await this.obtenerAlertas();
        return {
            total: alertas.length,
            criticas: alertas.filter(a => a.severidad === 'CRITICA').length,
            altas: alertas.filter(a => a.severidad === 'ALTA').length,
            medias: alertas.filter(a => a.severidad === 'MEDIA').length,
            bajas: alertas.filter(a => a.severidad === 'BAJA').length,
            alertas: alertas,
        };
    }
    async obtenerProductosReorden() {
        const productos = await this.productoRepository.find({
            where: { activo: true },
        });
        return productos
            .filter(p => p.punto_reorden && (p.stock || 0) <= p.punto_reorden)
            .map(p => ({
            id: p.id,
            codigo: p.codigo,
            sku: p.sku,
            nombre: p.nombre,
            stock_actual: p.stock || 0,
            punto_reorden: p.punto_reorden,
            stock_seguridad: p.stock_seguridad,
            tiempo_entrega_dias: p.tiempo_entrega_dias,
            diferencia: (p.punto_reorden || 0) - (p.stock || 0),
            urgencia: (p.stock || 0) === 0 ? 'CRITICA' :
                (p.stock || 0) <= (p.punto_reorden || 0) * 0.5 ? 'ALTA' : 'MEDIA',
        }))
            .sort((a, b) => a.diferencia - b.diferencia);
    }
};
exports.AlertasInventarioService = AlertasInventarioService;
exports.AlertasInventarioService = AlertasInventarioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AlertasInventarioService);
//# sourceMappingURL=alertas-inventario.service.js.map