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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestrictFinancialInfoGuard = void 0;
const common_1 = require("@nestjs/common");
const administracion_ti_service_1 = require("../administracion-ti.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
let RestrictFinancialInfoGuard = class RestrictFinancialInfoGuard {
    constructor(administracionTIService, usuarioRepository) {
        this.administracionTIService = administracionTIService;
        this.usuarioRepository = usuarioRepository;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const firebaseUser = request.user;
        if (!firebaseUser || !firebaseUser.email) {
            throw new common_1.ForbiddenException('Usuario no autenticado');
        }
        const usuario = await this.usuarioRepository.findOne({
            where: { email: firebaseUser.email },
        });
        if (!usuario) {
            return true;
        }
        const esAdminTI = await this.administracionTIService.esAdministradorTI(usuario.id);
        if (esAdminTI) {
            throw new common_1.ForbiddenException('Los Administradores de TI no tienen acceso a información financiera. ' +
                'Este módulo está restringido para mantener la privacidad de los datos financieros.');
        }
        return true;
    }
};
exports.RestrictFinancialInfoGuard = RestrictFinancialInfoGuard;
exports.RestrictFinancialInfoGuard = RestrictFinancialInfoGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => administracion_ti_service_1.AdministracionTIService))),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [administracion_ti_service_1.AdministracionTIService,
        typeorm_2.Repository])
], RestrictFinancialInfoGuard);
//# sourceMappingURL=restrict-financial-info.guard.js.map