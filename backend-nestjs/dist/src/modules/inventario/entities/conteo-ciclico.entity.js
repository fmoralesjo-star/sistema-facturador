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
exports.ConteoCiclico = void 0;
const typeorm_1 = require("typeorm");
const conteo_ciclico_detalle_entity_1 = require("./conteo-ciclico-detalle.entity");
let ConteoCiclico = class ConteoCiclico {
};
exports.ConteoCiclico = ConteoCiclico;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConteoCiclico.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], ConteoCiclico.prototype, "numero", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ConteoCiclico.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ConteoCiclico.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ConteoCiclico.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], ConteoCiclico.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ConteoCiclico.prototype, "usuario_responsable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ConteoCiclico.prototype, "fecha_inicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ConteoCiclico.prototype, "fecha_completado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConteoCiclico.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conteo_ciclico_detalle_entity_1.ConteoCiclicoDetalle, (detalle) => detalle.conteo, { cascade: true }),
    __metadata("design:type", Array)
], ConteoCiclico.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConteoCiclico.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConteoCiclico.prototype, "updated_at", void 0);
exports.ConteoCiclico = ConteoCiclico = __decorate([
    (0, typeorm_1.Entity)('conteos_ciclicos')
], ConteoCiclico);
//# sourceMappingURL=conteo-ciclico.entity.js.map