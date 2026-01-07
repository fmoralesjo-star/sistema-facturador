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
exports.OrdenCompra = void 0;
const typeorm_1 = require("typeorm");
const orden_compra_detalle_entity_1 = require("./orden-compra-detalle.entity");
const albaran_entity_1 = require("./albaran.entity");
let OrdenCompra = class OrdenCompra {
};
exports.OrdenCompra = OrdenCompra;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrdenCompra.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], OrdenCompra.prototype, "numero", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], OrdenCompra.prototype, "fecha_orden", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], OrdenCompra.prototype, "fecha_esperada", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], OrdenCompra.prototype, "proveedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], OrdenCompra.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OrdenCompra.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orden_compra_detalle_entity_1.OrdenCompraDetalle, (detalle) => detalle.orden_compra, { cascade: true }),
    __metadata("design:type", Array)
], OrdenCompra.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => albaran_entity_1.Albaran, (albaran) => albaran.orden_compra),
    __metadata("design:type", Array)
], OrdenCompra.prototype, "albaranes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OrdenCompra.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], OrdenCompra.prototype, "updated_at", void 0);
exports.OrdenCompra = OrdenCompra = __decorate([
    (0, typeorm_1.Entity)('ordenes_compra')
], OrdenCompra);
//# sourceMappingURL=orden-compra.entity.js.map