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
exports.AlbaranDetalle = void 0;
const typeorm_1 = require("typeorm");
const albaran_entity_1 = require("./albaran.entity");
const producto_entity_1 = require("../../productos/entities/producto.entity");
let AlbaranDetalle = class AlbaranDetalle {
};
exports.AlbaranDetalle = AlbaranDetalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AlbaranDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => albaran_entity_1.Albaran, (albaran) => albaran.detalles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'albaran_id' }),
    __metadata("design:type", albaran_entity_1.Albaran)
], AlbaranDetalle.prototype, "albaran", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AlbaranDetalle.prototype, "albaran_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", producto_entity_1.Producto)
], AlbaranDetalle.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AlbaranDetalle.prototype, "producto_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], AlbaranDetalle.prototype, "cantidad_esperada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], AlbaranDetalle.prototype, "cantidad_recibida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], AlbaranDetalle.prototype, "cantidad_faltante", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], AlbaranDetalle.prototype, "cantidad_danada", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'OK' }),
    __metadata("design:type", String)
], AlbaranDetalle.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AlbaranDetalle.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AlbaranDetalle.prototype, "created_at", void 0);
exports.AlbaranDetalle = AlbaranDetalle = __decorate([
    (0, typeorm_1.Entity)('albaranes_detalles')
], AlbaranDetalle);
//# sourceMappingURL=albaran-detalle.entity.js.map