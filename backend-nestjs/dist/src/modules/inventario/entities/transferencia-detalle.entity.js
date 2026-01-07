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
exports.TransferenciaDetalle = void 0;
const typeorm_1 = require("typeorm");
const transferencia_entity_1 = require("./transferencia.entity");
const producto_entity_1 = require("../../productos/entities/producto.entity");
let TransferenciaDetalle = class TransferenciaDetalle {
};
exports.TransferenciaDetalle = TransferenciaDetalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TransferenciaDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transferencia_entity_1.Transferencia, (transferencia) => transferencia.detalles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'transferencia_id' }),
    __metadata("design:type", transferencia_entity_1.Transferencia)
], TransferenciaDetalle.prototype, "transferencia", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TransferenciaDetalle.prototype, "transferencia_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", producto_entity_1.Producto)
], TransferenciaDetalle.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TransferenciaDetalle.prototype, "producto_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], TransferenciaDetalle.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], TransferenciaDetalle.prototype, "cantidad_recibida", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TransferenciaDetalle.prototype, "created_at", void 0);
exports.TransferenciaDetalle = TransferenciaDetalle = __decorate([
    (0, typeorm_1.Entity)('transferencias_detalles')
], TransferenciaDetalle);
//# sourceMappingURL=transferencia-detalle.entity.js.map