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
exports.AsientoContable = void 0;
const typeorm_1 = require("typeorm");
const factura_entity_1 = require("../../facturas/entities/factura.entity");
const partida_contable_entity_1 = require("./partida-contable.entity");
let AsientoContable = class AsientoContable {
};
exports.AsientoContable = AsientoContable;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AsientoContable.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], AsientoContable.prototype, "numero_asiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AsientoContable.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AsientoContable.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], AsientoContable.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], AsientoContable.prototype, "total_debe", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], AsientoContable.prototype, "total_haber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => factura_entity_1.Factura, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'factura_id' }),
    __metadata("design:type", Object)
], AsientoContable.prototype, "factura", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AsientoContable.prototype, "factura_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], AsientoContable.prototype, "origen_modulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AsientoContable.prototype, "origen_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'ACTIVO' }),
    __metadata("design:type", String)
], AsientoContable.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => partida_contable_entity_1.PartidaContable, (partida) => partida.asiento, {
        cascade: true,
        eager: false,
    }),
    __metadata("design:type", Array)
], AsientoContable.prototype, "partidas", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AsientoContable.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', select: false }),
    __metadata("design:type", Date)
], AsientoContable.prototype, "deleted_at", void 0);
exports.AsientoContable = AsientoContable = __decorate([
    (0, typeorm_1.Entity)('asientos_contables'),
    (0, typeorm_1.Index)(['numero_asiento'], { unique: true })
], AsientoContable);
//# sourceMappingURL=asiento-contable.entity.js.map