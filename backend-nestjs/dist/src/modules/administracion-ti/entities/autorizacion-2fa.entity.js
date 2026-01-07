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
exports.Autorizacion2FA = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
const rol_entity_1 = require("../../usuarios/entities/rol.entity");
let Autorizacion2FA = class Autorizacion2FA {
};
exports.Autorizacion2FA = Autorizacion2FA;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Autorizacion2FA.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_solicitante_id' }),
    __metadata("design:type", Number)
], Autorizacion2FA.prototype, "usuario_solicitante_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_autorizador_id' }),
    __metadata("design:type", Number)
], Autorizacion2FA.prototype, "usuario_autorizador_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rol_solicitado_id' }),
    __metadata("design:type", Number)
], Autorizacion2FA.prototype, "rol_solicitado_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_verificacion', length: 6 }),
    __metadata("design:type", String)
], Autorizacion2FA.prototype, "codigo_verificacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pendiente', 'aprobado', 'rechazado', 'expirado'], default: 'pendiente' }),
    __metadata("design:type", String)
], Autorizacion2FA.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_expiracion', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Autorizacion2FA.prototype, "fecha_expiracion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Autorizacion2FA.prototype, "fecha_aprobacion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Autorizacion2FA.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Autorizacion2FA.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_solicitante_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Autorizacion2FA.prototype, "usuario_solicitante", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_autorizador_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Autorizacion2FA.prototype, "usuario_autorizador", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rol_entity_1.Rol, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'rol_solicitado_id' }),
    __metadata("design:type", rol_entity_1.Rol)
], Autorizacion2FA.prototype, "rol_solicitado", void 0);
exports.Autorizacion2FA = Autorizacion2FA = __decorate([
    (0, typeorm_1.Entity)('autorizaciones_2fa')
], Autorizacion2FA);
//# sourceMappingURL=autorizacion-2fa.entity.js.map