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
exports.CuentaContable = void 0;
const typeorm_1 = require("typeorm");
let CuentaContable = class CuentaContable {
};
exports.CuentaContable = CuentaContable;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CuentaContable.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 20 }),
    __metadata("design:type", String)
], CuentaContable.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], CuentaContable.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], CuentaContable.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], CuentaContable.prototype, "nivel", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CuentaContable, (cuenta) => cuenta.hijos, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'padre_id' }),
    __metadata("design:type", CuentaContable)
], CuentaContable.prototype, "padre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CuentaContable.prototype, "padre_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CuentaContable, (cuenta) => cuenta.padre),
    __metadata("design:type", Array)
], CuentaContable.prototype, "hijos", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CuentaContable.prototype, "activa", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CuentaContable.prototype, "permite_movimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['DEUDORA', 'ACREEDORA'], default: 'DEUDORA' }),
    __metadata("design:type", String)
], CuentaContable.prototype, "naturaleza", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], CuentaContable.prototype, "sri_codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CuentaContable.prototype, "requiere_auxiliar", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CuentaContable.prototype, "requiere_centro_costo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CuentaContable.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CuentaContable.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CuentaContable.prototype, "updated_at", void 0);
exports.CuentaContable = CuentaContable = __decorate([
    (0, typeorm_1.Entity)('cuentas_contables'),
    (0, typeorm_1.Index)(['codigo'], { unique: true })
], CuentaContable);
//# sourceMappingURL=cuenta-contable.entity.js.map