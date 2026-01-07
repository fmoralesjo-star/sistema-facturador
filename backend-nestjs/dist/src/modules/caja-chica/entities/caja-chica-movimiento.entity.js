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
exports.CajaChicaMovimiento = exports.CategoriaGasto = void 0;
const typeorm_1 = require("typeorm");
const punto_venta_entity_1 = require("../../puntos-venta/entities/punto-venta.entity");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
var CategoriaGasto;
(function (CategoriaGasto) {
    CategoriaGasto["SERVICIOS_PUBLICOS"] = "SERVICIOS_PUBLICOS";
    CategoriaGasto["INTERNET_TELEFONIA"] = "INTERNET_TELEFONIA";
    CategoriaGasto["SUMINISTROS_OFICINA"] = "SUMINISTROS_OFICINA";
    CategoriaGasto["LIMPIEZA"] = "LIMPIEZA";
    CategoriaGasto["TRANSPORTE"] = "TRANSPORTE";
    CategoriaGasto["ALIMENTACION"] = "ALIMENTACION";
    CategoriaGasto["REPRESENTACION"] = "REPRESENTACION";
    CategoriaGasto["REPOSICION_FONDO"] = "REPOSICION_FONDO";
    CategoriaGasto["VARIOS"] = "VARIOS";
})(CategoriaGasto || (exports.CategoriaGasto = CategoriaGasto = {}));
let CajaChicaMovimiento = class CajaChicaMovimiento {
};
exports.CajaChicaMovimiento = CajaChicaMovimiento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CajaChicaMovimiento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CajaChicaMovimiento.prototype, "punto_venta_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => punto_venta_entity_1.PuntoVenta),
    (0, typeorm_1.JoinColumn)({ name: 'punto_venta_id' }),
    __metadata("design:type", punto_venta_entity_1.PuntoVenta)
], CajaChicaMovimiento.prototype, "punto_venta", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['INGRESO', 'GASTO'],
        default: 'GASTO'
    }),
    __metadata("design:type", String)
], CajaChicaMovimiento.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CategoriaGasto,
        default: CategoriaGasto.VARIOS
    }),
    __metadata("design:type", String)
], CajaChicaMovimiento.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CajaChicaMovimiento.prototype, "es_deducible", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CajaChicaMovimiento.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CajaChicaMovimiento.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CajaChicaMovimiento.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CajaChicaMovimiento.prototype, "numero_documento", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CajaChicaMovimiento.prototype, "proveedor_nombre", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CajaChicaMovimiento.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CajaChicaMovimiento.prototype, "usuario_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], CajaChicaMovimiento.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CajaChicaMovimiento.prototype, "saldo_resultante", void 0);
exports.CajaChicaMovimiento = CajaChicaMovimiento = __decorate([
    (0, typeorm_1.Entity)('caja_chica_movimientos')
], CajaChicaMovimiento);
//# sourceMappingURL=caja-chica-movimiento.entity.js.map