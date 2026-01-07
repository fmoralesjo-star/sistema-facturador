"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProformasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const proformas_service_1 = require("./proformas.service");
const proformas_controller_1 = require("./proformas.controller");
const proforma_entity_1 = require("./entities/proforma.entity");
const proforma_detalle_entity_1 = require("./entities/proforma-detalle.entity");
let ProformasModule = class ProformasModule {
};
exports.ProformasModule = ProformasModule;
exports.ProformasModule = ProformasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([proforma_entity_1.Proforma, proforma_detalle_entity_1.ProformaDetalle])],
        controllers: [proformas_controller_1.ProformasController],
        providers: [proformas_service_1.ProformasService],
        exports: [proformas_service_1.ProformasService]
    })
], ProformasModule);
//# sourceMappingURL=proformas.module.js.map