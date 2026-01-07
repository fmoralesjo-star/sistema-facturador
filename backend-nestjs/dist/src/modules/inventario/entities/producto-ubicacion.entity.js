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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoUbicacion = void 0;
const typeorm_1 = require("typeorm");
const producto_entity_1 = require("../../productos/entities/producto.entity");
const ubicacion_entity_1 = require("./ubicacion.entity");
let ProductoUbicacion = class ProductoUbicacion {
};
exports.ProductoUbicacion = ProductoUbicacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductoUbicacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", producto_entity_1.Producto)
], ProductoUbicacion.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ProductoUbicacion.prototype, "producto_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ubicacion_entity_1.Ubicacion, (ubicacion) => ubicacion.productosUbicacion),
    (0, typeorm_1.JoinColumn)({ name: 'ubicacion_id' }),
    __metadata("design:type", ubicacion_entity_1.Ubicacion)
], ProductoUbicacion.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ProductoUbicacion.prototype, "ubicacion_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], ProductoUbicacion.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ProductoUbicacion.prototype, "stock_minimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ProductoUbicacion.prototype, "stock_maximo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'DISPONIBLE' }),
    __metadata("design:type", String)
], ProductoUbicacion.prototype, "estado_stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProductoUbicacion.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProductoUbicacion.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProductoUbicacion.prototype, "updated_at", void 0);
exports.ProductoUbicacion = ProductoUbicacion = __decorate([
    (0, typeorm_1.Entity)('productos_ubicaciones'),
    (0, typeorm_1.Index)(['producto_id', 'ubicacion_id'], { unique: true })
], ProductoUbicacion);
//# sourceMappingURL=producto-ubicacion.entity.js.map