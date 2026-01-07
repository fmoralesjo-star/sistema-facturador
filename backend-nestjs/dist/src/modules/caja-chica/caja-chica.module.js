"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CajaChicaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const caja_chica_controller_1 = require("./caja-chica.controller");
const caja_chica_service_1 = require("./caja-chica.service");
const caja_chica_movimiento_entity_1 = require("./entities/caja-chica-movimiento.entity");
let CajaChicaModule = class CajaChicaModule {
};
exports.CajaChicaModule = CajaChicaModule;
exports.CajaChicaModule = CajaChicaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([caja_chica_movimiento_entity_1.CajaChicaMovimiento])],
        controllers: [caja_chica_controller_1.CajaChicaController],
        providers: [caja_chica_service_1.CajaChicaService],
        exports: [caja_chica_service_1.CajaChicaService]
    })
], CajaChicaModule);
//# sourceMappingURL=caja-chica.module.js.map