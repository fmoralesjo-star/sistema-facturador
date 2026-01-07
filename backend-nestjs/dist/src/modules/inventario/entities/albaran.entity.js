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
exports.Albaran = void 0;
const typeorm_1 = require("typeorm");
const orden_compra_entity_1 = require("./orden-compra.entity");
const albaran_detalle_entity_1 = require("./albaran-detalle.entity");
let Albaran = class Albaran {
};
exports.Albaran = Albaran;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Albaran.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], Albaran.prototype, "numero", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Albaran.prototype, "fecha_recepcion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orden_compra_entity_1.OrdenCompra, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'orden_compra_id' }),
    __metadata("design:type", orden_compra_entity_1.OrdenCompra)
], Albaran.prototype, "orden_compra", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Albaran.prototype, "orden_compra_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], Albaran.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Albaran.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Albaran.prototype, "usuario_recepcion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => albaran_detalle_entity_1.AlbaranDetalle, (detalle) => detalle.albaran, { cascade: true }),
    __metadata("design:type", Array)
], Albaran.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Albaran.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Albaran.prototype, "updated_at", void 0);
exports.Albaran = Albaran = __decorate([
    (0, typeorm_1.Entity)('albaranes')
], Albaran);
//# sourceMappingURL=albaran.entity.js.map