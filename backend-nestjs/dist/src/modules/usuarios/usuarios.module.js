"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usuarios_service_1 = require("./usuarios.service");
const usuarios_controller_1 = require("./usuarios.controller");
const usuario_entity_1 = require("./entities/usuario.entity");
const rol_entity_1 = require("./entities/rol.entity");
const usuario_permiso_entity_1 = require("./entities/usuario-permiso.entity");
const app_module_1 = require("../../app.module");
const insertar_roles_service_1 = require("./scripts/insertar-roles.service");
const crear_usuarios_prueba_service_1 = require("./scripts/crear-usuarios-prueba.service");
const audit_module_1 = require("../audit/audit.module");
let UsuariosModule = class UsuariosModule {
};
exports.UsuariosModule = UsuariosModule;
exports.UsuariosModule = UsuariosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([usuario_entity_1.Usuario, rol_entity_1.Rol, usuario_permiso_entity_1.UsuarioPermiso]),
            (0, common_1.forwardRef)(() => app_module_1.AppModule),
            audit_module_1.AuditModule,
        ],
        controllers: [usuarios_controller_1.UsuariosController],
        providers: [usuarios_service_1.UsuariosService, insertar_roles_service_1.InsertarRolesService, crear_usuarios_prueba_service_1.CrearUsuariosPruebaService],
        exports: [usuarios_service_1.UsuariosService],
    })
], UsuariosModule);
//# sourceMappingURL=usuarios.module.js.map