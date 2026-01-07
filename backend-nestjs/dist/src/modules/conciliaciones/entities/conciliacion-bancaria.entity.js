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
exports.ConciliacionBancaria = void 0;
const typeorm_1 = require("typeorm");
const banco_entity_1 = require("../../bancos/entities/banco.entity");
const factura_entity_1 = require("../../facturas/entities/factura.entity");
let ConciliacionBancaria = class ConciliacionBancaria {
};
exports.ConciliacionBancaria = ConciliacionBancaria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConciliacionBancaria.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => banco_entity_1.Banco),
    (0, typeorm_1.JoinColumn)({ name: 'banco_id' }),
    __metadata("design:type", banco_entity_1.Banco)
], ConciliacionBancaria.prototype, "banco", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ConciliacionBancaria.prototype, "banco_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => factura_entity_1.Factura, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'factura_id' }),
    __metadata("design:type", factura_entity_1.Factura)
], ConciliacionBancaria.prototype, "factura", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ConciliacionBancaria.prototype, "factura_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ConciliacionBancaria.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConciliacionBancaria.prototype, "fecha_valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], ConciliacionBancaria.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], ConciliacionBancaria.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], ConciliacionBancaria.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], ConciliacionBancaria.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], ConciliacionBancaria.prototype, "forma_pago", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], ConciliacionBancaria.prototype, "metodo_pago", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ConciliacionBancaria.prototype, "conciliado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConciliacionBancaria.prototype, "fecha_conciliacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], ConciliacionBancaria.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConciliacionBancaria.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConciliacionBancaria.prototype, "updated_at", void 0);
exports.ConciliacionBancaria = ConciliacionBancaria = __decorate([
    (0, typeorm_1.Entity)('conciliaciones_bancarias')
], ConciliacionBancaria);
//# sourceMappingURL=conciliacion-bancaria.entity.js.map