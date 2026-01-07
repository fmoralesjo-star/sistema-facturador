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
exports.NotaCreditoDetalle = exports.NotaCredito = void 0;
const typeorm_1 = require("typeorm");
const factura_entity_1 = require("../../facturas/entities/factura.entity");
const cliente_entity_1 = require("../../clientes/entities/cliente.entity");
let NotaCredito = class NotaCredito {
};
exports.NotaCredito = NotaCredito;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NotaCredito.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], NotaCredito.prototype, "numero", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], NotaCredito.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => factura_entity_1.Factura),
    (0, typeorm_1.JoinColumn)({ name: 'factura_id' }),
    __metadata("design:type", factura_entity_1.Factura)
], NotaCredito.prototype, "factura", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NotaCredito.prototype, "factura_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], NotaCredito.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NotaCredito.prototype, "cliente_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], NotaCredito.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], NotaCredito.prototype, "impuesto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], NotaCredito.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], NotaCredito.prototype, "motivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'EMITIDO' }),
    __metadata("design:type", String)
], NotaCredito.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 49, nullable: true }),
    __metadata("design:type", String)
], NotaCredito.prototype, "clave_acceso", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], NotaCredito.prototype, "autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], NotaCredito.prototype, "fecha_autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], NotaCredito.prototype, "info_adicional", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => NotaCreditoDetalle, (detalle) => detalle.notaCredito, { cascade: true }),
    __metadata("design:type", Array)
], NotaCredito.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotaCredito.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotaCredito.prototype, "updated_at", void 0);
exports.NotaCredito = NotaCredito = __decorate([
    (0, typeorm_1.Entity)('notas_credito')
], NotaCredito);
let NotaCreditoDetalle = class NotaCreditoDetalle {
};
exports.NotaCreditoDetalle = NotaCreditoDetalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NotaCreditoDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => NotaCredito, (nc) => nc.detalles),
    (0, typeorm_1.JoinColumn)({ name: 'nota_credito_id' }),
    __metadata("design:type", NotaCredito)
], NotaCreditoDetalle.prototype, "notaCredito", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NotaCreditoDetalle.prototype, "nota_credito_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NotaCreditoDetalle.prototype, "producto_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], NotaCreditoDetalle.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], NotaCreditoDetalle.prototype, "precio_unitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], NotaCreditoDetalle.prototype, "subtotal", void 0);
exports.NotaCreditoDetalle = NotaCreditoDetalle = __decorate([
    (0, typeorm_1.Entity)('nota_credito_detalles')
], NotaCreditoDetalle);
//# sourceMappingURL=nota-credito.entity.js.map