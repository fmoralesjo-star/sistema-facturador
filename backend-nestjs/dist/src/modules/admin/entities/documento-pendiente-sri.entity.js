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
exports.DocumentoPendienteSRI = void 0;
const typeorm_1 = require("typeorm");
let DocumentoPendienteSRI = class DocumentoPendienteSRI {
};
exports.DocumentoPendienteSRI = DocumentoPendienteSRI;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DocumentoPendienteSRI.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['FACTURA', 'NOTA_CREDITO', 'ANULACION', 'RETENCION'],
    }),
    __metadata("design:type", String)
], DocumentoPendienteSRI.prototype, "tipo_documento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DocumentoPendienteSRI.prototype, "documento_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DocumentoPendienteSRI.prototype, "numero_documento", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DocumentoPendienteSRI.prototype, "cliente_nombre", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], DocumentoPendienteSRI.prototype, "xml_contenido", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DocumentoPendienteSRI.prototype, "intentos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DocumentoPendienteSRI.prototype, "ultimo_intento", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], DocumentoPendienteSRI.prototype, "ultimo_error", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PENDIENTE', 'ENVIANDO', 'AUTORIZADA', 'ERROR_PERMANENTE'],
        default: 'PENDIENTE',
    }),
    __metadata("design:type", String)
], DocumentoPendienteSRI.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DocumentoPendienteSRI.prototype, "fecha_creacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DocumentoPendienteSRI.prototype, "fecha_autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DocumentoPendienteSRI.prototype, "clave_acceso", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DocumentoPendienteSRI.prototype, "numero_autorizacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DocumentoPendienteSRI.prototype, "fecha_actualizacion", void 0);
exports.DocumentoPendienteSRI = DocumentoPendienteSRI = __decorate([
    (0, typeorm_1.Entity)('documentos_pendientes_sri')
], DocumentoPendienteSRI);
//# sourceMappingURL=documento-pendiente-sri.entity.js.map