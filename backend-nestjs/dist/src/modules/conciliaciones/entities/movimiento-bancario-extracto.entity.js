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
exports.MovimientoBancarioExtracto = void 0;
const typeorm_1 = require("typeorm");
const banco_entity_1 = require("../../bancos/entities/banco.entity");
let MovimientoBancarioExtracto = class MovimientoBancarioExtracto {
};
exports.MovimientoBancarioExtracto = MovimientoBancarioExtracto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MovimientoBancarioExtracto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => banco_entity_1.Banco),
    (0, typeorm_1.JoinColumn)({ name: 'banco_id' }),
    __metadata("design:type", Object)
], MovimientoBancarioExtracto.prototype, "banco", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MovimientoBancarioExtracto.prototype, "banco_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], MovimientoBancarioExtracto.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MovimientoBancarioExtracto.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], MovimientoBancarioExtracto.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], MovimientoBancarioExtracto.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MovimientoBancarioExtracto.prototype, "conciliado", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MovimientoBancarioExtracto.prototype, "conciliacion_bancaria_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MovimientoBancarioExtracto.prototype, "created_at", void 0);
exports.MovimientoBancarioExtracto = MovimientoBancarioExtracto = __decorate([
    (0, typeorm_1.Entity)('movimientos_bancarios_extracto')
], MovimientoBancarioExtracto);
//# sourceMappingURL=movimiento-bancario-extracto.entity.js.map