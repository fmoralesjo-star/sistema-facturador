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
exports.PickingDetalle = void 0;
const typeorm_1 = require("typeorm");
const picking_entity_1 = require("./picking.entity");
const producto_entity_1 = require("../../productos/entities/producto.entity");
const ubicacion_entity_1 = require("./ubicacion.entity");
let PickingDetalle = class PickingDetalle {
};
exports.PickingDetalle = PickingDetalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PickingDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => picking_entity_1.Picking, (picking) => picking.detalles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'picking_id' }),
    __metadata("design:type", picking_entity_1.Picking)
], PickingDetalle.prototype, "picking", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PickingDetalle.prototype, "picking_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", producto_entity_1.Producto)
], PickingDetalle.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PickingDetalle.prototype, "producto_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ubicacion_entity_1.Ubicacion, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ubicacion_id' }),
    __metadata("design:type", ubicacion_entity_1.Ubicacion)
], PickingDetalle.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PickingDetalle.prototype, "ubicacion_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], PickingDetalle.prototype, "cantidad_solicitada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], PickingDetalle.prototype, "cantidad_picked", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], PickingDetalle.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], PickingDetalle.prototype, "orden_picking", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PickingDetalle.prototype, "created_at", void 0);
exports.PickingDetalle = PickingDetalle = __decorate([
    (0, typeorm_1.Entity)('pickings_detalles')
], PickingDetalle);
//# sourceMappingURL=picking-detalle.entity.js.map