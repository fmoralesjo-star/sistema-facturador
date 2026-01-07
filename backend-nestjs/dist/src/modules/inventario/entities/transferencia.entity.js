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
exports.Transferencia = void 0;
const typeorm_1 = require("typeorm");
const transferencia_detalle_entity_1 = require("./transferencia-detalle.entity");
const punto_venta_entity_1 = require("../../puntos-venta/entities/punto-venta.entity");
let Transferencia = class Transferencia {
};
exports.Transferencia = Transferencia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transferencia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], Transferencia.prototype, "numero", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Transferencia.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => punto_venta_entity_1.PuntoVenta),
    (0, typeorm_1.JoinColumn)({ name: 'origen_id' }),
    __metadata("design:type", punto_venta_entity_1.PuntoVenta)
], Transferencia.prototype, "origenPuntoVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Transferencia.prototype, "origen_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Transferencia.prototype, "origen", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => punto_venta_entity_1.PuntoVenta),
    (0, typeorm_1.JoinColumn)({ name: 'destino_id' }),
    __metadata("design:type", punto_venta_entity_1.PuntoVenta)
], Transferencia.prototype, "destinoPuntoVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Transferencia.prototype, "destino_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Transferencia.prototype, "destino", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], Transferencia.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Transferencia.prototype, "usuario_envio", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Transferencia.prototype, "usuario_recepcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Transferencia.prototype, "fecha_envio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Transferencia.prototype, "fecha_recepcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Transferencia.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transferencia_detalle_entity_1.TransferenciaDetalle, (detalle) => detalle.transferencia, { cascade: true }),
    __metadata("design:type", Array)
], Transferencia.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Transferencia.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Transferencia.prototype, "updated_at", void 0);
exports.Transferencia = Transferencia = __decorate([
    (0, typeorm_1.Entity)('transferencias')
], Transferencia);
//# sourceMappingURL=transferencia.entity.js.map