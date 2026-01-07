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
exports.PuntoVenta = void 0;
const typeorm_1 = require("typeorm");
const producto_punto_venta_entity_1 = require("../../inventario/entities/producto-punto-venta.entity");
let PuntoVenta = class PuntoVenta {
};
exports.PuntoVenta = PuntoVenta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PuntoVenta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], PuntoVenta.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, unique: true }),
    __metadata("design:type", String)
], PuntoVenta.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PuntoVenta.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], PuntoVenta.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], PuntoVenta.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PuntoVenta.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'TIENDA' }),
    __metadata("design:type", String)
], PuntoVenta.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PuntoVenta.prototype, "es_principal", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PuntoVenta.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PuntoVenta.prototype, "secuencia_factura", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PuntoVenta.prototype, "secuencia_nota_credito", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => producto_punto_venta_entity_1.ProductoPuntoVenta, (stock) => stock.puntoVenta),
    __metadata("design:type", Array)
], PuntoVenta.prototype, "stocks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PuntoVenta.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PuntoVenta.prototype, "updated_at", void 0);
exports.PuntoVenta = PuntoVenta = __decorate([
    (0, typeorm_1.Entity)('puntos_venta')
], PuntoVenta);
//# sourceMappingURL=punto-venta.entity.js.map