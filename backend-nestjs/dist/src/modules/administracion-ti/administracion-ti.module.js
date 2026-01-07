"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministracionTIModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const administracion_ti_controller_1 = require("./administracion-ti.controller");
const administracion_ti_service_1 = require("./administracion-ti.service");
const autorizacion_2fa_entity_1 = require("./entities/autorizacion-2fa.entity");
const usuario_entity_1 = require("../usuarios/entities/usuario.entity");
const rol_entity_1 = require("../usuarios/entities/rol.entity");
const usuarios_module_1 = require("../usuarios/usuarios.module");
const restrict_financial_info_guard_1 = require("./guards/restrict-financial-info.guard");
const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';
let AdministracionTIModule = class AdministracionTIModule {
};
exports.AdministracionTIModule = AdministracionTIModule;
exports.AdministracionTIModule = AdministracionTIModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...(useFirestore ? [] : [typeorm_1.TypeOrmModule.forFeature([autorizacion_2fa_entity_1.Autorizacion2FA, usuario_entity_1.Usuario, rol_entity_1.Rol])]),
            (0, common_1.forwardRef)(() => usuarios_module_1.UsuariosModule),
        ],
        controllers: [administracion_ti_controller_1.AdministracionTIController],
        providers: [administracion_ti_service_1.AdministracionTIService, restrict_financial_info_guard_1.RestrictFinancialInfoGuard],
        exports: [
            administracion_ti_service_1.AdministracionTIService,
            restrict_financial_info_guard_1.RestrictFinancialInfoGuard,
            ...(useFirestore ? [] : [typeorm_1.TypeOrmModule]),
        ],
    })
], AdministracionTIModule);
//# sourceMappingURL=administracion-ti.module.js.map