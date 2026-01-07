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
exports.AdministracionTIService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_1 = require("../usuarios/entities/usuario.entity");
const rol_entity_1 = require("../usuarios/entities/rol.entity");
const autorizacion_2fa_entity_1 = require("./entities/autorizacion-2fa.entity");
const crypto = require("crypto");
const usuarios_service_1 = require("../usuarios/usuarios.service");
const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';
let AdministracionTIService = class AdministracionTIService {
    constructor(usuarioRepository, rolRepository, autorizacion2FARepository, usuariosService) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.autorizacion2FARepository = autorizacion2FARepository;
        this.usuariosService = usuariosService;
    }
    async esAdministradorTI(usuarioId) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: usuarioId },
            relations: ['rol'],
        });
        if (!usuario || !usuario.rol) {
            return false;
        }
        const nombreRol = usuario.rol.nombre.toLowerCase();
        return nombreRol === 'administrador de ti' || nombreRol === 'admin ti' || nombreRol === 'administrador ti';
    }
    async esDueñoEmpresa(usuarioId) {
        if (useFirestore) {
            const usuario = await this.usuariosService.findOne(String(usuarioId));
            if (!usuario || !usuario.rol_id) {
                return false;
            }
            const rol = await this.usuariosService.findOneRol(String(usuario.rol_id));
            if (!rol) {
                return false;
            }
            const nombreRol = rol.nombre.toLowerCase();
            return nombreRol === 'dueño' || nombreRol === 'propietario' || nombreRol === 'owner';
        }
        else {
            const usuario = await this.usuarioRepository.findOne({
                where: { id: Number(usuarioId) },
                relations: ['rol'],
            });
            if (!usuario || !usuario.rol) {
                return false;
            }
            const nombreRol = usuario.rol.nombre.toLowerCase();
            return nombreRol === 'dueño' || nombreRol === 'propietario' || nombreRol === 'owner';
        }
    }
    async obtenerDueñoEmpresa() {
        const rolDueño = await this.rolRepository.findOne({
            where: [
                { nombre: 'Dueño' },
                { nombre: 'Propietario' },
                { nombre: 'Owner' },
            ],
        });
        if (!rolDueño) {
            return null;
        }
        const dueño = await this.usuarioRepository.findOne({
            where: { rol_id: rolDueño.id, activo: 1 },
        });
        return dueño;
    }
    generarCodigoVerificacion() {
        return crypto.randomInt(100000, 999999).toString();
    }
    async solicitarRolContador(adminTIId, solicitud) {
        const esAdminTI = await this.esAdministradorTI(adminTIId);
        if (!esAdminTI) {
            throw new common_1.ForbiddenException('Solo los Administradores de TI pueden solicitar esta autorización');
        }
        const rolContador = await this.rolRepository.findOne({
            where: { id: solicitud.rol_contador_id },
        });
        if (!rolContador) {
            throw new common_1.NotFoundException('Rol no encontrado');
        }
        const nombreRol = rolContador.nombre.toLowerCase();
        if (nombreRol !== 'contador') {
            throw new common_1.BadRequestException('Solo se puede solicitar autorización para el rol de Contador');
        }
        const usuarioDestino = await this.usuarioRepository.findOne({
            where: { id: solicitud.usuario_id },
        });
        if (!usuarioDestino) {
            throw new common_1.NotFoundException('Usuario destino no encontrado');
        }
        if (usuarioDestino.id === adminTIId) {
            const dueño = await this.obtenerDueñoEmpresa();
            if (!dueño) {
                throw new common_1.NotFoundException('No se encontró un dueño de la empresa para autorizar');
            }
            const autorizacionExistente = await this.autorizacion2FARepository.findOne({
                where: {
                    usuario_solicitante_id: adminTIId,
                    usuario_autorizador_id: dueño.id,
                    rol_solicitado_id: solicitud.rol_contador_id,
                    estado: 'pendiente',
                },
            });
            if (autorizacionExistente) {
                if (autorizacionExistente.fecha_expiracion &&
                    new Date() < autorizacionExistente.fecha_expiracion) {
                    throw new common_1.BadRequestException('Ya existe una solicitud pendiente de autorización');
                }
                else {
                    autorizacionExistente.estado = 'expirado';
                    await this.autorizacion2FARepository.save(autorizacionExistente);
                }
            }
            const codigo = this.generarCodigoVerificacion();
            const autorizacion = this.autorizacion2FARepository.create({
                usuario_solicitante_id: adminTIId,
                usuario_autorizador_id: dueño.id,
                rol_solicitado_id: solicitud.rol_contador_id,
                codigo_verificacion: codigo,
                estado: 'pendiente',
                fecha_expiracion: new Date(Date.now() + 15 * 60 * 1000),
            });
            const autorizacionGuardada = await this.autorizacion2FARepository.save(autorizacion);
            return {
                autorizacion_id: autorizacionGuardada.id,
                mensaje: `Se ha enviado un código de verificación al dueño de la empresa. Código: ${codigo} (solo para desarrollo)`,
            };
        }
        else {
            throw new common_1.BadRequestException('Para asignar el rol de Contador a otro usuario, se requiere autorización del dueño');
        }
    }
    async verificar2FA(dueñoId, verificarDto) {
        const esDueño = await this.esDueñoEmpresa(dueñoId);
        if (!esDueño) {
            throw new common_1.ForbiddenException('Solo el dueño de la empresa puede verificar esta autorización');
        }
        const autorizacion = await this.autorizacion2FARepository.findOne({
            where: { id: verificarDto.autorizacion_id },
            relations: ['usuario_solicitante', 'usuario_autorizador'],
        });
        if (!autorizacion) {
            throw new common_1.NotFoundException('Autorización no encontrada');
        }
        if (autorizacion.usuario_autorizador_id !== dueñoId) {
            throw new common_1.ForbiddenException('Esta autorización no le corresponde');
        }
        if (autorizacion.estado !== 'pendiente') {
            throw new common_1.BadRequestException(`La autorización ya fue ${autorizacion.estado}`);
        }
        if (autorizacion.fecha_expiracion && new Date() > autorizacion.fecha_expiracion) {
            autorizacion.estado = 'expirado';
            await this.autorizacion2FARepository.save(autorizacion);
            throw new common_1.BadRequestException('El código de verificación ha expirado');
        }
        if (autorizacion.codigo_verificacion !== verificarDto.codigo_verificacion) {
            throw new common_1.BadRequestException('Código de verificación incorrecto');
        }
        autorizacion.estado = 'aprobado';
        autorizacion.fecha_aprobacion = new Date();
        await this.autorizacion2FARepository.save(autorizacion);
        await this.usuariosService.update(autorizacion.usuario_solicitante_id, {
            rol_id: autorizacion.rol_solicitado_id,
        });
        return {
            success: true,
            mensaje: 'Rol asignado exitosamente',
        };
    }
    async obtenerAutorizacionesPendientes(dueñoId) {
        return this.autorizacion2FARepository.find({
            where: {
                usuario_autorizador_id: dueñoId,
                estado: 'pendiente',
            },
            relations: ['usuario_solicitante', 'usuario_autorizador'],
            order: { created_at: 'DESC' },
        });
    }
    async obtenerHistorialAutorizaciones(adminTIId) {
        return this.autorizacion2FARepository.find({
            where: {
                usuario_solicitante_id: adminTIId,
            },
            relations: ['usuario_autorizador', 'usuario_solicitante'],
            order: { created_at: 'DESC' },
        });
    }
};
exports.AdministracionTIService = AdministracionTIService;
exports.AdministracionTIService = AdministracionTIService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __param(2, (0, typeorm_1.InjectRepository)(autorizacion_2fa_entity_1.Autorizacion2FA)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => usuarios_service_1.UsuariosService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], AdministracionTIService);
//# sourceMappingURL=administracion-ti.service.js.map