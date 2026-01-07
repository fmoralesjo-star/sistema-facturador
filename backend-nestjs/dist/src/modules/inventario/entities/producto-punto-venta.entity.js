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
exports.ProductoPuntoVenta = void 0;
const typeorm_1 = require("typeorm");
const producto_entity_1 = require("../../productos/entities/producto.entity");
const punto_venta_entity_1 = require("../../puntos-venta/entities/punto-venta.entity");
let ProductoPuntoVenta = class ProductoPuntoVenta {
};
exports.ProductoPuntoVenta = ProductoPuntoVenta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductoPuntoVenta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", producto_entity_1.Producto)
], ProductoPuntoVenta.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ProductoPuntoVenta.prototype, "producto_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => punto_venta_entity_1.PuntoVenta, (puntoVenta) => puntoVenta.stocks),
    (0, typeorm_1.JoinColumn)({ name: 'punto_venta_id' }),
    __metadata("design:type", punto_venta_entity_1.PuntoVenta)
], ProductoPuntoVenta.prototype, "puntoVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], ProductoPuntoVenta.prototype, "punto_venta_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], ProductoPuntoVenta.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ProductoPuntoVenta.prototype, "stock_minimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProductoPuntoVenta.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProductoPuntoVenta.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProductoPuntoVenta.prototype, "updated_at", void 0);
exports.ProductoPuntoVenta = ProductoPuntoVenta = __decorate([
    (0, typeorm_1.Entity)('productos_puntos_venta'),
    (0, typeorm_1.Index)(['producto_id', 'punto_venta_id'], { unique: true })
], ProductoPuntoVenta);
//# sourceMappingURL=producto-punto-venta.entity.js.map