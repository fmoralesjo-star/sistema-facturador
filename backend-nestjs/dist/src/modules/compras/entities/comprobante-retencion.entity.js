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
exports.ComprobanteRetencion = exports.EstadoRetencion = void 0;
const typeorm_1 = require("typeorm");
var EstadoRetencion;
(function (EstadoRetencion) {
    EstadoRetencion["GENERADO"] = "GENERADO";
    EstadoRetencion["FIRMADO"] = "FIRMADO";
    EstadoRetencion["ENVIADO"] = "ENVIADO";
    EstadoRetencion["AUTORIZADO"] = "AUTORIZADO";
    EstadoRetencion["RECHAZADO"] = "RECHAZADO";
    EstadoRetencion["ERROR"] = "ERROR";
})(EstadoRetencion || (exports.EstadoRetencion = EstadoRetencion = {}));
let ComprobanteRetencion = class ComprobanteRetencion {
};
exports.ComprobanteRetencion = ComprobanteRetencion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "compra_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 49, unique: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "clave_acceso", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "establecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "punto_emision", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 9 }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "secuencial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ComprobanteRetencion.prototype, "fecha_emision", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "proveedor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 13 }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "ruc_proveedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "razon_social_proveedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '01' }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "codigo_sustento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '01' }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "tipo_doc_sustento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 17 }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "numero_doc_sustento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ComprobanteRetencion.prototype, "fecha_doc_sustento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "retencion_renta_codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "retencion_renta_porcentaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "retencion_renta_base", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "retencion_renta_valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "retencion_iva_codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "retencion_iva_porcentaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "retencion_iva_base", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "retencion_iva_valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ComprobanteRetencion.prototype, "total_retenido", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'GENERADO' }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 49, nullable: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "numero_autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ComprobanteRetencion.prototype, "fecha_autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "xml_generado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "xml_firmado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "xml_autorizado", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "pdf_path", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ComprobanteRetencion.prototype, "mensajes_sri", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ComprobanteRetencion.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ComprobanteRetencion.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ComprobanteRetencion.prototype, "updated_at", void 0);
exports.ComprobanteRetencion = ComprobanteRetencion = __decorate([
    (0, typeorm_1.Entity)('comprobantes_retencion')
], ComprobanteRetencion);
//# sourceMappingURL=comprobante-retencion.entity.js.map