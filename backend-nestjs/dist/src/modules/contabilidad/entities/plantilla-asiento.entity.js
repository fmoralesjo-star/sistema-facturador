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
exports.PlantillaAsiento = exports.OrigenAsiento = void 0;
const typeorm_1 = require("typeorm");
const plantilla_detalle_entity_1 = require("./plantilla-detalle.entity");
var OrigenAsiento;
(function (OrigenAsiento) {
    OrigenAsiento["VENTAS"] = "VENTAS";
    OrigenAsiento["COMPRAS"] = "COMPRAS";
    OrigenAsiento["TESORERIA"] = "TESORERIA";
    OrigenAsiento["INVENTARIO"] = "INVENTARIO";
    OrigenAsiento["NOMINA"] = "NOMINA";
})(OrigenAsiento || (exports.OrigenAsiento = OrigenAsiento = {}));
let PlantillaAsiento = class PlantillaAsiento {
};
exports.PlantillaAsiento = PlantillaAsiento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlantillaAsiento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], PlantillaAsiento.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], PlantillaAsiento.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OrigenAsiento }),
    __metadata("design:type", String)
], PlantillaAsiento.prototype, "origen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PlantillaAsiento.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PlantillaAsiento.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => plantilla_detalle_entity_1.PlantillaDetalle, (detalle) => detalle.plantilla, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], PlantillaAsiento.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PlantillaAsiento.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PlantillaAsiento.prototype, "updated_at", void 0);
exports.PlantillaAsiento = PlantillaAsiento = __decorate([
    (0, typeorm_1.Entity)('plantillas_asientos')
], PlantillaAsiento);
//# sourceMappingURL=plantilla-asiento.entity.js.map