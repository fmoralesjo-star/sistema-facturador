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
exports.Ubicacion = void 0;
const typeorm_1 = require("typeorm");
const producto_ubicacion_entity_1 = require("./producto-ubicacion.entity");
let Ubicacion = class Ubicacion {
};
exports.Ubicacion = Ubicacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ubicacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Ubicacion.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Ubicacion.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'BODEGA' }),
    __metadata("design:type", String)
], Ubicacion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Ubicacion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Ubicacion.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Ubicacion.prototype, "activa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => producto_ubicacion_entity_1.ProductoUbicacion, (productoUbicacion) => productoUbicacion.ubicacion),
    __metadata("design:type", Array)
], Ubicacion.prototype, "productosUbicacion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Ubicacion.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Ubicacion.prototype, "updated_at", void 0);
exports.Ubicacion = Ubicacion = __decorate([
    (0, typeorm_1.Entity)('ubicaciones')
], Ubicacion);
//# sourceMappingURL=ubicacion.entity.js.map