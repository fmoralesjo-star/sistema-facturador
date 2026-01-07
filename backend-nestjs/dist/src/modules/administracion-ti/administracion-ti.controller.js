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
exports.AdministracionTIController = void 0;
const common_1 = require("@nestjs/common");
const administracion_ti_service_1 = require("./administracion-ti.service");
const solicitar_rol_contador_dto_1 = require("./dto/solicitar-rol-contador.dto");
const verificar_2fa_dto_1 = require("./dto/verificar-2fa.dto");
const firebase_auth_guard_1 = require("../firebase/guards/firebase-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_1 = require("../usuarios/entities/usuario.entity");
const usuarios_service_1 = require("../usuarios/usuarios.service");
let AdministracionTIController = class AdministracionTIController {
    constructor(administracionTIService, usuarioRepository, usuariosService) {
        this.administracionTIService = administracionTIService;
        this.usuarioRepository = usuarioRepository;
        this.usuariosService = usuariosService;
    }
    async obtenerUsuarioId(req) {
        const firebaseUser = req.user;
        if (!firebaseUser || !firebaseUser.email) {
            throw new common_1.ForbiddenException('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
        }
        let usuario = await this.usuarioRepository.findOne({
            where: { email: firebaseUser.email },
        });
        if (!usuario) {
            try {
                usuario = await this.usuariosService.syncFirebaseUser(firebaseUser.uid, firebaseUser.email, firebaseUser.name || firebaseUser.email?.split('@')[0] || 'Usuario');
            }
            catch (error) {
                console.error('Error al sincronizar usuario:', error);
            }
        }
        if (!usuario) {
            throw new common_1.ForbiddenException('Usuario no encontrado en la base de datos. Por favor, contacta al administrador del sistema.');
        }
        return usuario.id;
    }
    async verificarAdminTI(req) {
        try {
            const usuarioId = await this.obtenerUsuarioId(req);
            const esAdminTI = await this.administracionTIService.esAdministradorTI(usuarioId);
            return {
                esAdminTI,
                usuarioId,
                mensaje: esAdminTI
                    ? 'Acceso autorizado como Administrador de TI'
                    : 'No tienes permisos de Administrador de TI'
            };
        }
        catch (error) {
            throw new common_1.ForbiddenException(error.message || 'Error al verificar permisos. Por favor, contacta al administrador.');
        }
    }
    async solicitarRolContador(req, solicitud) {
        const usuarioId = await this.obtenerUsuarioId(req);
        return this.administracionTIService.solicitarRolContador(usuarioId, solicitud);
    }
    async verificar2FA(req, verificarDto) {
        const usuarioId = await this.obtenerUsuarioId(req);
        return this.administracionTIService.verificar2FA(usuarioId, verificarDto);
    }
    async obtenerAutorizacionesPendientes(req) {
        const usuarioId = await this.obtenerUsuarioId(req);
        return this.administracionTIService.obtenerAutorizacionesPendientes(usuarioId);
    }
    async obtenerHistorialAutorizaciones(req) {
        const usuarioId = await this.obtenerUsuarioId(req);
        return this.administracionTIService.obtenerHistorialAutorizaciones(usuarioId);
    }
};
exports.AdministracionTIController = AdministracionTIController;
__decorate([
    (0, common_1.Get)('verificar-admin-ti'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdministracionTIController.prototype, "verificarAdminTI", null);
__decorate([
    (0, common_1.Post)('solicitar-rol-contador'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, solicitar_rol_contador_dto_1.SolicitarRolContadorDto]),
    __metadata("design:returntype", Promise)
], AdministracionTIController.prototype, "solicitarRolContador", null);
__decorate([
    (0, common_1.Post)('verificar-2fa'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verificar_2fa_dto_1.Verificar2FADto]),
    __metadata("design:returntype", Promise)
], AdministracionTIController.prototype, "verificar2FA", null);
__decorate([
    (0, common_1.Get)('autorizaciones-pendientes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdministracionTIController.prototype, "obtenerAutorizacionesPendientes", null);
__decorate([
    (0, common_1.Get)('historial-autorizaciones'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdministracionTIController.prototype, "obtenerHistorialAutorizaciones", null);
exports.AdministracionTIController = AdministracionTIController = __decorate([
    (0, common_1.Controller)('administracion-ti'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [administracion_ti_service_1.AdministracionTIService,
        typeorm_2.Repository,
        usuarios_service_1.UsuariosService])
], AdministracionTIController);
//# sourceMappingURL=administracion-ti.controller.js.map