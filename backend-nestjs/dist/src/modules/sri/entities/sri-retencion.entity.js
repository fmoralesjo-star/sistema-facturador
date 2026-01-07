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
exports.SriRetencion = exports.TipoRetencion = void 0;
const typeorm_1 = require("typeorm");
var TipoRetencion;
(function (TipoRetencion) {
    TipoRetencion["RENTA"] = "RENTA";
    TipoRetencion["IVA"] = "IVA";
    TipoRetencion["ISD"] = "ISD";
})(TipoRetencion || (exports.TipoRetencion = TipoRetencion = {}));
let SriRetencion = class SriRetencion {
};
exports.SriRetencion = SriRetencion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SriRetencion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 10 }),
    __metadata("design:type", String)
], SriRetencion.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], SriRetencion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], SriRetencion.prototype, "porcentaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoRetencion, default: TipoRetencion.RENTA }),
    __metadata("design:type", String)
], SriRetencion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], SriRetencion.prototype, "fecha_vigencia_inicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], SriRetencion.prototype, "fecha_vigencia_fin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SriRetencion.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SriRetencion.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SriRetencion.prototype, "updated_at", void 0);
exports.SriRetencion = SriRetencion = __decorate([
    (0, typeorm_1.Entity)('sri_retenciones')
], SriRetencion);
//# sourceMappingURL=sri-retencion.entity.js.map