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
exports.ProductosService = exports.UpdateProductoDto = exports.CreateProductoDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const producto_entity_1 = require("./entities/producto.entity");
const events_gateway_1 = require("../../gateways/events.gateway");
class CreateProductoDto {
}
exports.CreateProductoDto = CreateProductoDto;
class UpdateProductoDto {
}
exports.UpdateProductoDto = UpdateProductoDto;
let ProductosService = class ProductosService {
    constructor(productoRepository, eventsGateway) {
        this.productoRepository = productoRepository;
        this.eventsGateway = eventsGateway;
    }
    async findAll() {
        return this.productoRepository.find({
            order: { nombre: 'ASC' },
        });
    }
    async findByCodigoOrBarrasOrSku(codigo, codBarras, sku) {
        const queryBuilder = this.productoRepository.createQueryBuilder('producto');
        const condiciones = [];
        const parametros = {};
        if (codigo) {
            condiciones.push('producto.codigo = :codigo');
            parametros.codigo = codigo;
        }
        if (codBarras) {
            condiciones.push('producto.cod_barras = :codBarras');
            parametros.codBarras = codBarras;
        }
        if (sku) {
            condiciones.push('producto.sku = :sku');
            parametros.sku = sku;
        }
        if (condiciones.length > 0) {
            queryBuilder.where(`(${condiciones.join(' OR ')})`, parametros);
        }
        return queryBuilder.getMany();
    }
    async findOne(id) {
        const producto = await this.productoRepository.findOne({ where: { id } });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        return producto;
    }
    async create(createDto) {
        const producto = this.productoRepository.create({
            ...createDto,
            stock: createDto.stock || 0,
            fecha_movimiento: createDto.fecha_movimiento
                ? (typeof createDto.fecha_movimiento === 'string'
                    ? new Date(createDto.fecha_movimiento)
                    : createDto.fecha_movimiento)
                : new Date(),
        });
        const saved = await this.productoRepository.save(producto);
        this.eventsGateway.emitProductoCreado(saved);
        return saved;
    }
    async update(id, updateDto) {
        const producto = await this.findOne(id);
        Object.assign(producto, updateDto);
        const saved = await this.productoRepository.save(producto);
        this.eventsGateway.emitProductoActualizado(saved);
        return saved;
    }
    async remove(id) {
        const producto = await this.findOne(id);
        await this.productoRepository.softRemove(producto);
        this.eventsGateway.emitProductoEliminado(id);
        return { success: true };
    }
    async crearProductoEjemplo() {
        try {
            const existe = await this.productoRepository.findOne({
                where: [{ codigo: 'PRENDA-001' }, { sku: 'PRENDA-XS-001' }],
            });
            if (existe) {
                return {
                    success: false,
                    message: 'El producto de ejemplo ya existe (Código: PRENDA-001 o SKU: PRENDA-XS-001)',
                    producto: existe,
                };
            }
            const producto = this.productoRepository.create({
                codigo: 'PRENDA-001',
                sku: 'PRENDA-XS-001',
                nombre: 'Camiseta Básica - Talla XS',
                descripcion: 'Camiseta de algodón 100%, color blanco, talla XS. Ideal para uso diario. Material suave y cómodo.',
                precio: 25.99,
                stock: 45,
                tipo_impuesto: '15',
                activo: true,
                punto_reorden: 30,
                stock_seguridad: 15,
                tiempo_entrega_dias: 7,
                costo_promedio: 15.50,
            });
            const productoGuardado = await this.productoRepository.save(producto);
            this.eventsGateway.emitProductoCreado(productoGuardado);
            return {
                success: true,
                message: 'Producto de ejemplo creado exitosamente',
                producto: productoGuardado,
            };
        }
        catch (error) {
            console.error('Error al crear producto de ejemplo:', error);
            throw error;
        }
    }
    async crearProductosMasivos(productosDto) {
        const resultados = {
            exitosos: [],
            fallidos: [],
            total: productosDto.length,
        };
        for (const productoDto of productosDto) {
            try {
                const existe = await this.productoRepository.findOne({
                    where: [
                        { codigo: productoDto.codigo },
                        ...(productoDto.sku ? [{ sku: productoDto.sku }] : []),
                    ],
                });
                if (existe) {
                    resultados.fallidos.push({
                        producto: productoDto,
                        error: `Ya existe un producto con código "${productoDto.codigo}"${productoDto.sku ? ` o SKU "${productoDto.sku}"` : ''}`,
                    });
                    continue;
                }
                const producto = this.productoRepository.create({
                    ...productoDto,
                    stock: productoDto.stock || 0,
                    tipo_impuesto: '15',
                    activo: true,
                });
                const productoGuardado = await this.productoRepository.save(producto);
                this.eventsGateway.emitProductoCreado(productoGuardado);
                resultados.exitosos.push(productoGuardado);
            }
            catch (error) {
                resultados.fallidos.push({
                    producto: productoDto,
                    error: error.message || 'Error desconocido al crear el producto',
                });
            }
        }
        return resultados;
    }
};
exports.ProductosService = ProductosService;
exports.ProductosService = ProductosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => events_gateway_1.EventsGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        events_gateway_1.EventsGateway])
], ProductosService);
//# sourceMappingURL=productos.service.js.map