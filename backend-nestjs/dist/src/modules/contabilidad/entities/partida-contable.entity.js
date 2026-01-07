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
exports.PartidaContable = void 0;
const typeorm_1 = require("typeorm");
const asiento_contable_entity_1 = require("./asiento-contable.entity");
const cuenta_contable_entity_1 = require("./cuenta-contable.entity");
let PartidaContable = class PartidaContable {
};
exports.PartidaContable = PartidaContable;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PartidaContable.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => asiento_contable_entity_1.AsientoContable, (asiento) => asiento.partidas, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'asiento_id' }),
    __metadata("design:type", Object)
], PartidaContable.prototype, "asiento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PartidaContable.prototype, "asiento_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cuenta_contable_entity_1.CuentaContable),
    (0, typeorm_1.JoinColumn)({ name: 'cuenta_id' }),
    __metadata("design:type", cuenta_contable_entity_1.CuentaContable)
], PartidaContable.prototype, "cuenta", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PartidaContable.prototype, "cuenta_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartidaContable.prototype, "debe", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartidaContable.prototype, "haber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartidaContable.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tercero_id', nullable: true }),
    __metadata("design:type", Number)
], PartidaContable.prototype, "tercero_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tercero_tipo', length: 20, nullable: true }),
    __metadata("design:type", String)
], PartidaContable.prototype, "tercero_tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'centro_costo_id', nullable: true }),
    __metadata("design:type", Number)
], PartidaContable.prototype, "centro_costo_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sri_sustento_id', nullable: true }),
    __metadata("design:type", String)
], PartidaContable.prototype, "sri_sustento_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PartidaContable.prototype, "created_at", void 0);
exports.PartidaContable = PartidaContable = __decorate([
    (0, typeorm_1.Entity)('partidas_contables')
], PartidaContable);
//# sourceMappingURL=partida-contable.entity.js.map