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
exports.Cheque = exports.TipoCheque = exports.EstadoCheque = void 0;
const typeorm_1 = require("typeorm");
const banco_entity_1 = require("../../bancos/entities/banco.entity");
const proveedor_entity_1 = require("../../compras/entities/proveedor.entity");
const cliente_entity_1 = require("../../clientes/entities/cliente.entity");
var EstadoCheque;
(function (EstadoCheque) {
    EstadoCheque["EMITIDO"] = "EMITIDO";
    EstadoCheque["ENTREGADO"] = "ENTREGADO";
    EstadoCheque["COBRADO"] = "COBRADO";
    EstadoCheque["ANULADO"] = "ANULADO";
    EstadoCheque["PROTESTADO"] = "PROTESTADO";
    EstadoCheque["DEPOSITADO"] = "DEPOSITADO";
})(EstadoCheque || (exports.EstadoCheque = EstadoCheque = {}));
var TipoCheque;
(function (TipoCheque) {
    TipoCheque["GIRADO"] = "GIRADO";
    TipoCheque["RECIBIDO"] = "RECIBIDO";
})(TipoCheque || (exports.TipoCheque = TipoCheque = {}));
let Cheque = class Cheque {
};
exports.Cheque = Cheque;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Cheque.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Cheque.prototype, "numero", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Cheque.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Cheque.prototype, "fecha_emision", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Cheque.prototype, "fecha_pago", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Cheque.prototype, "beneficiario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoCheque, default: TipoCheque.GIRADO }),
    __metadata("design:type", String)
], Cheque.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EstadoCheque, default: EstadoCheque.EMITIDO }),
    __metadata("design:type", String)
], Cheque.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => banco_entity_1.Banco, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'banco_id' }),
    __metadata("design:type", Object)
], Cheque.prototype, "banco", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Cheque.prototype, "banco_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proveedor_entity_1.Proveedor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'proveedor_id' }),
    __metadata("design:type", Object)
], Cheque.prototype, "proveedor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", Object)
], Cheque.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Cheque.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Cheque.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Cheque.prototype, "updated_at", void 0);
exports.Cheque = Cheque = __decorate([
    (0, typeorm_1.Entity)('cheques')
], Cheque);
//# sourceMappingURL=cheque.entity.js.map