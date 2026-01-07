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
exports.OrdenCompraDetalle = void 0;
const typeorm_1 = require("typeorm");
const orden_compra_entity_1 = require("./orden-compra.entity");
const producto_entity_1 = require("../../productos/entities/producto.entity");
let OrdenCompraDetalle = class OrdenCompraDetalle {
};
exports.OrdenCompraDetalle = OrdenCompraDetalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrdenCompraDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orden_compra_entity_1.OrdenCompra, (orden) => orden.detalles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'orden_compra_id' }),
    __metadata("design:type", orden_compra_entity_1.OrdenCompra)
], OrdenCompraDetalle.prototype, "orden_compra", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrdenCompraDetalle.prototype, "orden_compra_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", producto_entity_1.Producto)
], OrdenCompraDetalle.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrdenCompraDetalle.prototype, "producto_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], OrdenCompraDetalle.prototype, "cantidad_pedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], OrdenCompraDetalle.prototype, "cantidad_recibida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], OrdenCompraDetalle.prototype, "precio_unitario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OrdenCompraDetalle.prototype, "created_at", void 0);
exports.OrdenCompraDetalle = OrdenCompraDetalle = __decorate([
    (0, typeorm_1.Entity)('ordenes_compra_detalles')
], OrdenCompraDetalle);
//# sourceMappingURL=orden-compra-detalle.entity.js.map