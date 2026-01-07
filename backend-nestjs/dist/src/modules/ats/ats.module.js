"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ats_controller_1 = require("./ats.controller");
const ats_service_1 = require("./ats.service");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const compra_entity_1 = require("../compras/entities/compra.entity");
const empresa_entity_1 = require("../empresa/entities/empresa.entity");
let AtsModule = class AtsModule {
};
exports.AtsModule = AtsModule;
exports.AtsModule = AtsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([factura_entity_1.Factura, compra_entity_1.Compra, empresa_entity_1.Empresa])
        ],
        controllers: [ats_controller_1.AtsController],
        providers: [ats_service_1.AtsService],
        exports: [ats_service_1.AtsService]
    })
], AtsModule);
//# sourceMappingURL=ats.module.js.map