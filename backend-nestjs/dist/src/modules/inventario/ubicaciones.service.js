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
exports.UbicacionesService = exports.AsignarProductoUbicacionDto = exports.UpdateUbicacionDto = exports.CreateUbicacionDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ubicacion_entity_1 = require("./entities/ubicacion.entity");
const producto_ubicacion_entity_1 = require("./entities/producto-ubicacion.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
class CreateUbicacionDto {
}
exports.CreateUbicacionDto = CreateUbicacionDto;
class UpdateUbicacionDto {
}
exports.UpdateUbicacionDto = UpdateUbicacionDto;
class AsignarProductoUbicacionDto {
}
exports.AsignarProductoUbicacionDto = AsignarProductoUbicacionDto;
let UbicacionesService = class UbicacionesService {
    constructor(ubicacionRepository, productoUbicacionRepository, productoRepository) {
        this.ubicacionRepository = ubicacionRepository;
        this.productoUbicacionRepository = productoUbicacionRepository;
        this.productoRepository = productoRepository;
    }
    async findAll() {
        return this.ubicacionRepository.find({
            where: { activa: true },
            order: { nombre: 'ASC' },
        });
    }
    async findOne(id) {
        const ubicacion = await this.ubicacionRepository.findOne({
            where: { id },
            relations: ['productosUbicacion', 'productosUbicacion.producto'],
        });
        if (!ubicacion) {
            throw new common_1.NotFoundException(`Ubicación con ID ${id} no encontrada`);
        }
        return ubicacion;
    }
    async create(createDto) {
        const ubicacion = this.ubicacionRepository.create({
            ...createDto,
            tipo: createDto.tipo || 'BODEGA',
        });
        return this.ubicacionRepository.save(ubicacion);
    }
    async update(id, updateDto) {
        const ubicacion = await this.findOne(id);
        Object.assign(ubicacion, updateDto);
        return this.ubicacionRepository.save(ubicacion);
    }
    async remove(id) {
        const ubicacion = await this.findOne(id);
        await this.ubicacionRepository.remove(ubicacion);
        return { success: true };
    }
    async asignarProducto(dto) {
        const producto = await this.productoRepository.findOne({
            where: { id: dto.producto_id },
        });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con ID ${dto.producto_id} no encontrado`);
        }
        const ubicacion = await this.ubicacionRepository.findOne({
            where: { id: dto.ubicacion_id },
        });
        if (!ubicacion) {
            throw new common_1.NotFoundException(`Ubicación con ID ${dto.ubicacion_id} no encontrada`);
        }
        let productoUbicacion = await this.productoUbicacionRepository.findOne({
            where: {
                producto_id: dto.producto_id,
                ubicacion_id: dto.ubicacion_id,
            },
        });
        if (productoUbicacion) {
            productoUbicacion.stock = dto.stock;
            if (dto.stock_minimo !== undefined)
                productoUbicacion.stock_minimo = dto.stock_minimo;
            if (dto.stock_maximo !== undefined)
                productoUbicacion.stock_maximo = dto.stock_maximo;
            if (dto.estado_stock !== undefined)
                productoUbicacion.estado_stock = dto.estado_stock;
            if (dto.observaciones !== undefined)
                productoUbicacion.observaciones = dto.observaciones;
        }
        else {
            productoUbicacion = this.productoUbicacionRepository.create({
                producto_id: dto.producto_id,
                ubicacion_id: dto.ubicacion_id,
                stock: dto.stock,
                stock_minimo: dto.stock_minimo,
                stock_maximo: dto.stock_maximo,
                estado_stock: dto.estado_stock || 'DISPONIBLE',
                observaciones: dto.observaciones,
            });
        }
        return this.productoUbicacionRepository.save(productoUbicacion);
    }
    async obtenerStockPorUbicacion(productoId) {
        const stocks = await this.productoUbicacionRepository.find({
            where: { producto_id: productoId },
            relations: ['ubicacion'],
        });
        return stocks.map((pu) => ({
            ubicacion_id: pu.ubicacion_id,
            ubicacion_nombre: pu.ubicacion.nombre,
            ubicacion_codigo: pu.ubicacion.codigo,
            ubicacion_tipo: pu.ubicacion.tipo,
            stock: pu.stock,
            stock_minimo: pu.stock_minimo,
            stock_maximo: pu.stock_maximo,
            estado_stock: pu.estado_stock,
        }));
    }
    async obtenerProductosPorUbicacion(ubicacionId) {
        const productosUbicacion = await this.productoUbicacionRepository.find({
            where: { ubicacion_id: ubicacionId },
            relations: ['producto', 'ubicacion'],
        });
        return productosUbicacion.map((pu) => ({
            id: pu.producto.id,
            codigo: pu.producto.codigo,
            sku: pu.producto.sku,
            nombre: pu.producto.nombre,
            precio: pu.producto.precio,
            stock: pu.stock,
            stock_minimo: pu.stock_minimo,
            stock_maximo: pu.stock_maximo,
            estado_stock: pu.estado_stock,
            ubicacion_nombre: pu.ubicacion.nombre,
            ubicacion_codigo: pu.ubicacion.codigo,
        }));
    }
};
exports.UbicacionesService = UbicacionesService;
exports.UbicacionesService = UbicacionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ubicacion_entity_1.Ubicacion)),
    __param(1, (0, typeorm_1.InjectRepository)(producto_ubicacion_entity_1.ProductoUbicacion)),
    __param(2, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UbicacionesService);
//# sourceMappingURL=ubicaciones.service.js.map