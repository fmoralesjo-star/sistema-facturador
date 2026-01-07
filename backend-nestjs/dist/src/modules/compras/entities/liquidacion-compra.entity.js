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
exports.LiquidacionCompra = void 0;
const typeorm_1 = require("typeorm");
let LiquidacionCompra = class LiquidacionCompra {
};
exports.LiquidacionCompra = LiquidacionCompra;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LiquidacionCompra.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '001' }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "establecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '001' }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "punto_emision", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "secuencial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LiquidacionCompra.prototype, "fecha_emision", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "proveedor_identificacion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "proveedor_nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "proveedor_direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "proveedor_telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "proveedor_email", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "concepto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LiquidacionCompra.prototype, "subtotal_0", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LiquidacionCompra.prototype, "subtotal_12", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LiquidacionCompra.prototype, "iva", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], LiquidacionCompra.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LiquidacionCompra.prototype, "retencion_renta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LiquidacionCompra.prototype, "retencion_iva", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "codigo_retencion_renta", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "codigo_retencion_iva", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "numero_autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], LiquidacionCompra.prototype, "fecha_autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: 'PENDIENTE'
    }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "xml_path", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "pdf_path", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LiquidacionCompra.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LiquidacionCompra.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], LiquidacionCompra.prototype, "observaciones", void 0);
exports.LiquidacionCompra = LiquidacionCompra = __decorate([
    (0, typeorm_1.Entity)('liquidaciones_compra')
], LiquidacionCompra);
//# sourceMappingURL=liquidacion-compra.entity.js.map