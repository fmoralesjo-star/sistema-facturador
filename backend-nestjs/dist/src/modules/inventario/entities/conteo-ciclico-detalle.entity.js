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
exports.ConteoCiclicoDetalle = void 0;
const typeorm_1 = require("typeorm");
const conteo_ciclico_entity_1 = require("./conteo-ciclico.entity");
const producto_entity_1 = require("../../productos/entities/producto.entity");
let ConteoCiclicoDetalle = class ConteoCiclicoDetalle {
};
exports.ConteoCiclicoDetalle = ConteoCiclicoDetalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConteoCiclicoDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conteo_ciclico_entity_1.ConteoCiclico, (conteo) => conteo.detalles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'conteo_id' }),
    __metadata("design:type", conteo_ciclico_entity_1.ConteoCiclico)
], ConteoCiclicoDetalle.prototype, "conteo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ConteoCiclicoDetalle.prototype, "conteo_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", producto_entity_1.Producto)
], ConteoCiclicoDetalle.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ConteoCiclicoDetalle.prototype, "producto_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], ConteoCiclicoDetalle.prototype, "cantidad_sistema", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ConteoCiclicoDetalle.prototype, "cantidad_fisica", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ConteoCiclicoDetalle.prototype, "diferencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], ConteoCiclicoDetalle.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConteoCiclicoDetalle.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConteoCiclicoDetalle.prototype, "created_at", void 0);
exports.ConteoCiclicoDetalle = ConteoCiclicoDetalle = __decorate([
    (0, typeorm_1.Entity)('conteos_ciclicos_detalles')
], ConteoCiclicoDetalle);
//# sourceMappingURL=conteo-ciclico-detalle.entity.js.map