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
exports.IntegracionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const movimiento_inventario_entity_1 = require("../inventario/entities/movimiento-inventario.entity");
const asiento_contable_entity_1 = require("../contabilidad/entities/asiento-contable.entity");
const promocion_entity_1 = require("../promociones/entities/promocion.entity");
const transferencia_entity_1 = require("../transferencias/entities/transferencia.entity");
const empleado_entity_1 = require("../recursos-humanos/entities/empleado.entity");
let IntegracionService = class IntegracionService {
    constructor(facturaRepository, productoRepository, movimientoRepository, asientoRepository, promocionRepository, transferenciaRepository, empleadoRepository) {
        this.facturaRepository = facturaRepository;
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
        this.asientoRepository = asientoRepository;
        this.promocionRepository = promocionRepository;
        this.transferenciaRepository = transferenciaRepository;
        this.empleadoRepository = empleadoRepository;
    }
    async obtenerEstadisticasConsolidadas() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hoyFin = new Date(hoy);
        hoyFin.setHours(23, 59, 59, 999);
        const [facturasHoy, productosTotal, productosBajoStock, movimientosHoy, promocionesActivas, transferenciasHoy, empleadosActivos,] = await Promise.all([
            this.facturaRepository
                .createQueryBuilder('factura')
                .where('factura.fecha >= :hoy', { hoy })
                .andWhere('factura.fecha <= :hoyFin', { hoyFin })
                .getMany(),
            this.productoRepository.count(),
            this.productoRepository
                .createQueryBuilder('producto')
                .where('producto.stock <= producto.punto_reorden')
                .getCount(),
            this.movimientoRepository
                .createQueryBuilder('movimiento')
                .where('movimiento.fecha >= :hoy', { hoy })
                .andWhere('movimiento.fecha <= :hoyFin', { hoyFin })
                .getCount(),
            this.promocionRepository.count({
                where: { estado: 'activa' },
            }),
            this.transferenciaRepository
                .createQueryBuilder('transferencia')
                .where('transferencia.fecha >= :hoy', { hoy })
                .andWhere('transferencia.fecha <= :hoyFin', { hoyFin })
                .getCount(),
            this.empleadoRepository.count({
                where: { activo: true },
            }),
        ]);
        const totalVentasHoy = facturasHoy.reduce((sum, f) => sum + (parseFloat(f.total?.toString() || '0') || 0), 0);
        return {
            facturacion: {
                facturas_hoy: facturasHoy.length,
                total_ventas_hoy: totalVentasHoy,
            },
            inventario: {
                productos_total: productosTotal,
                productos_bajo_stock: productosBajoStock,
                movimientos_hoy: movimientosHoy,
            },
            promociones: {
                activas: promocionesActivas,
            },
            transferencias: {
                hoy: transferenciasHoy,
            },
            recursos_humanos: {
                empleados_activos: empleadosActivos,
            },
        };
    }
    async obtenerProductoIntegrado(productoId) {
        const producto = await this.productoRepository.findOne({
            where: { id: productoId },
        });
        if (!producto) {
            return null;
        }
        const [movimientos, facturas, promociones,] = await Promise.all([
            this.movimientoRepository.find({
                where: { producto_id: productoId },
                order: { fecha: 'DESC' },
                take: 10,
            }),
            this.facturaRepository
                .createQueryBuilder('factura')
                .innerJoin('factura.detalles', 'detalle')
                .where('detalle.producto_id = :productoId', { productoId })
                .orderBy('factura.fecha', 'DESC')
                .take(10)
                .getMany(),
            this.promocionRepository.find({
                where: [
                    { producto_id: productoId, estado: 'activa' },
                    { producto_id: null, estado: 'activa' },
                ],
            }),
        ]);
        return {
            producto,
            movimientos,
            facturas,
            promociones,
        };
    }
    async obtenerFacturaIntegrada(facturaId) {
        const factura = await this.facturaRepository.findOne({
            where: { id: facturaId },
            relations: ['detalles', 'detalles.producto'],
        });
        if (!factura) {
            return null;
        }
        const [movimientos, asientoContable,] = await Promise.all([
            this.movimientoRepository.find({
                where: { factura_id: facturaId },
            }),
            this.asientoRepository.findOne({
                where: { factura_id: facturaId },
                relations: ['partidas', 'partidas.cuenta'],
            }),
        ]);
        return {
            factura,
            movimientos,
            asientoContable,
        };
    }
};
exports.IntegracionService = IntegracionService;
exports.IntegracionService = IntegracionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(2, (0, typeorm_1.InjectRepository)(movimiento_inventario_entity_1.MovimientoInventario)),
    __param(3, (0, typeorm_1.InjectRepository)(asiento_contable_entity_1.AsientoContable)),
    __param(4, (0, typeorm_1.InjectRepository)(promocion_entity_1.Promocion)),
    __param(5, (0, typeorm_1.InjectRepository)(transferencia_entity_1.Transferencia)),
    __param(6, (0, typeorm_1.InjectRepository)(empleado_entity_1.Empleado)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], IntegracionService);
//# sourceMappingURL=integracion.service.js.map