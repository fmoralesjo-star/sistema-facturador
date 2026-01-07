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
exports.ProductosFirestoreService = void 0;
const common_1 = require("@nestjs/common");
const firestore_service_1 = require("../firebase/firestore.service");
const events_gateway_1 = require("../../gateways/events.gateway");
let ProductosFirestoreService = class ProductosFirestoreService {
    constructor(firestoreService, eventsGateway) {
        this.firestoreService = firestoreService;
        this.eventsGateway = eventsGateway;
        this.collectionName = 'productos';
    }
    async findAll() {
        if (!this.firestoreService.isAvailable()) {
            return [];
        }
        return this.firestoreService.findAll(this.collectionName, undefined, { field: 'nombre', direction: 'asc' });
    }
    async findOne(id) {
        if (!this.firestoreService.isAvailable()) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        const producto = await this.firestoreService.findOne(this.collectionName, id);
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        return producto;
    }
    async findByCodigo(codigo) {
        if (!this.firestoreService.isAvailable()) {
            return null;
        }
        const productos = await this.firestoreService.findByField(this.collectionName, 'codigo', codigo);
        return productos.length > 0 ? productos[0] : null;
    }
    async create(createDto) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        if (createDto.codigo) {
            const existe = await this.findByCodigo(createDto.codigo);
            if (existe) {
                throw new Error(`Ya existe un producto con código "${createDto.codigo}"`);
            }
        }
        const productoData = {
            ...createDto,
            stock: createDto.stock || 0,
            fecha_movimiento: createDto.fecha_movimiento
                ? (typeof createDto.fecha_movimiento === 'string'
                    ? new Date(createDto.fecha_movimiento)
                    : createDto.fecha_movimiento)
                : new Date(),
            tipo_impuesto: '15',
            activo: true,
        };
        const id = await this.firestoreService.create(this.collectionName, productoData);
        const producto = { id, ...productoData };
        this.eventsGateway.emitProductoCreado(producto);
        return producto;
    }
    async update(id, updateDto) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        await this.findOne(id);
        const updateData = { ...updateDto };
        if (updateDto.fecha_movimiento) {
            updateData.fecha_movimiento = typeof updateDto.fecha_movimiento === 'string'
                ? new Date(updateDto.fecha_movimiento)
                : updateDto.fecha_movimiento;
        }
        await this.firestoreService.update(this.collectionName, id, updateData);
        const producto = await this.findOne(id);
        this.eventsGateway.emitProductoActualizado(producto);
        return producto;
    }
    async remove(id) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        await this.findOne(id);
        await this.firestoreService.delete(this.collectionName, id);
        this.eventsGateway.emitProductoEliminado(id);
        return { success: true };
    }
    async crearProductoEjemplo() {
        try {
            if (!this.firestoreService.isAvailable()) {
                throw new Error('Firestore no está disponible');
            }
            const existe = await this.findByCodigo('PRENDA-001');
            if (existe) {
                return {
                    success: false,
                    message: 'El producto de ejemplo ya existe (Código: PRENDA-001)',
                    producto: existe,
                };
            }
            const productoData = {
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
            };
            const id = await this.firestoreService.create(this.collectionName, productoData);
            const producto = { id, ...productoData };
            this.eventsGateway.emitProductoCreado(producto);
            return {
                success: true,
                message: 'Producto de ejemplo creado exitosamente',
                producto,
            };
        }
        catch (error) {
            console.error('Error al crear producto de ejemplo:', error);
            throw error;
        }
    }
};
exports.ProductosFirestoreService = ProductosFirestoreService;
exports.ProductosFirestoreService = ProductosFirestoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => events_gateway_1.EventsGateway))),
    __metadata("design:paramtypes", [firestore_service_1.FirestoreService,
        events_gateway_1.EventsGateway])
], ProductosFirestoreService);
//# sourceMappingURL=productos-firestore.service.js.map