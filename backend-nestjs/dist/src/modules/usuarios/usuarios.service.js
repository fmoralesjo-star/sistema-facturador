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
exports.UsuariosService = exports.PermisoDto = exports.UpdateUsuarioDto = exports.CreateUsuarioDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_1 = require("./entities/usuario.entity");
const rol_entity_1 = require("./entities/rol.entity");
const usuario_permiso_entity_1 = require("./entities/usuario-permiso.entity");
const events_gateway_1 = require("../../gateways/events.gateway");
const audit_service_1 = require("../audit/audit.service");
let bcrypt;
try {
    bcrypt = require('bcrypt');
}
catch (e) {
    console.warn('⚠️  bcrypt no está instalado. Ejecuta: npm install bcrypt @types/bcrypt');
    bcrypt = {
        hash: async (password, rounds) => {
            console.warn('⚠️  Usando hash temporal inseguro. Instala bcrypt para producción.');
            return password;
        }
    };
}
const class_validator_1 = require("class-validator");
class CreateUsuarioDto {
}
exports.CreateUsuarioDto = CreateUsuarioDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "nombre_usuario", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "nombre_completo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateUsuarioDto.prototype, "activo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateUsuarioDto.prototype, "rol_id", void 0);
class UpdateUsuarioDto {
}
exports.UpdateUsuarioDto = UpdateUsuarioDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUsuarioDto.prototype, "nombre_usuario", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUsuarioDto.prototype, "nombre_completo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUsuarioDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateUsuarioDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateUsuarioDto.prototype, "activo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateUsuarioDto.prototype, "rol_id", void 0);
class PermisoDto {
}
exports.PermisoDto = PermisoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermisoDto.prototype, "modulo", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermisoDto.prototype, "tiene_acceso", void 0);
let UsuariosService = class UsuariosService {
    constructor(usuarioRepository, rolRepository, permisoRepository, eventsGateway, auditService) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.permisoRepository = permisoRepository;
        this.eventsGateway = eventsGateway;
        this.auditService = auditService;
    }
    async findAll() {
        try {
            const usuarios = await this.usuarioRepository.find({
                relations: ['rol'],
                order: { nombre_completo: 'ASC' },
            });
            console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
            return usuarios;
        }
        catch (error) {
            console.error('❌ Error al obtener usuarios:', error);
            throw error;
        }
    }
    async findOne(id) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id },
            relations: ['rol', 'permisos'],
        });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return usuario;
    }
    async findByUsername(nombre_usuario) {
        return this.usuarioRepository.findOne({
            where: { nombre_usuario },
            relations: ['rol', 'permisos'],
        });
    }
    async create(createDto) {
        const existe = await this.usuarioRepository.findOne({
            where: { nombre_usuario: createDto.nombre_usuario },
        });
        if (existe) {
            throw new common_1.BadRequestException('El nombre de usuario ya existe');
        }
        if (createDto.rol_id) {
            const rol = await this.rolRepository.findOne({ where: { id: createDto.rol_id } });
            if (!rol) {
                throw new common_1.NotFoundException(`Rol con ID ${createDto.rol_id} no encontrado`);
            }
        }
        const hashedPassword = await bcrypt.hash(createDto.password, 10);
        const usuario = this.usuarioRepository.create({
            ...createDto,
            password: hashedPassword,
            activo: createDto.activo ?? 1,
        });
        const saved = await this.usuarioRepository.save(usuario);
        if (saved.rol_id) {
            await this.aplicarPermisosPorRol(saved.id, saved.rol_id);
        }
        await this.auditService.create({
            accion: 'CREATE_USER',
            modulo: 'USUARIOS',
            entidad_id: saved.id,
            valor_nuevo: saved,
            usuario_nombre: 'Admin',
            ip_address: '127.0.0.1'
        });
        return saved;
    }
    async update(id, updateDto) {
        const usuario = await this.findOne(id);
        if (updateDto.nombre_usuario && updateDto.nombre_usuario !== usuario.nombre_usuario) {
            const existe = await this.usuarioRepository.findOne({
                where: { nombre_usuario: updateDto.nombre_usuario },
            });
            if (existe) {
                throw new common_1.BadRequestException('El nombre de usuario ya existe');
            }
        }
        if (updateDto.rol_id) {
            const rol = await this.rolRepository.findOne({ where: { id: updateDto.rol_id } });
            if (!rol) {
                throw new common_1.NotFoundException(`Rol con ID ${updateDto.rol_id} no encontrado`);
            }
            if (updateDto.rol_id !== usuario.rol_id) {
                await this.aplicarPermisosPorRol(id, updateDto.rol_id);
            }
        }
        if (updateDto.password) {
            updateDto.password = await bcrypt.hash(updateDto.password, 10);
        }
        Object.assign(usuario, updateDto);
        const saved = await this.usuarioRepository.save(usuario);
        await this.auditService.create({
            accion: 'UPDATE_USER',
            modulo: 'USUARIOS',
            entidad_id: saved.id,
            valor_anterior: usuario,
            valor_nuevo: saved,
            usuario_nombre: 'Admin',
            ip_address: '127.0.0.1'
        });
        return saved;
    }
    async remove(id) {
        const usuario = await this.findOne(id);
        if (usuario.nombre_usuario === 'admin') {
            throw new common_1.BadRequestException('No se puede eliminar el usuario administrador');
        }
        try {
            await this.usuarioRepository.remove(usuario);
            await this.auditService.create({
                accion: 'DELETE_USER',
                modulo: 'USUARIOS',
                entidad_id: id,
                valor_anterior: usuario,
                usuario_nombre: 'Admin',
                ip_address: '127.0.0.1'
            });
            return { success: true, message: 'Usuario eliminado permanentemente' };
        }
        catch (error) {
            if (error.code === '23503') {
                usuario.activo = 0;
                await this.usuarioRepository.save(usuario);
                return { success: true, message: 'El usuario tiene registros asociados. Se ha desactivado en lugar de eliminarlo.' };
            }
            throw error;
        }
    }
    async getPermisos(usuarioId) {
        return this.permisoRepository.find({
            where: { usuario_id: usuarioId },
        });
    }
    async updatePermisos(usuarioId, permisos) {
        const usuario = await this.findOne(usuarioId);
        await this.permisoRepository.delete({ usuario_id: usuarioId });
        const nuevosPermisos = permisos.map((permiso) => this.permisoRepository.create({
            usuario_id: usuarioId,
            modulo: permiso.modulo,
            tiene_acceso: permiso.tiene_acceso ? 1 : 0,
        }));
        await this.permisoRepository.save(nuevosPermisos);
        return this.getPermisos(usuarioId);
    }
    async findAllRoles() {
        return this.rolRepository.find({
            order: { nombre: 'ASC' },
        });
    }
    async findOneRol(id) {
        const rol = await this.rolRepository.findOne({ where: { id } });
        if (!rol) {
            throw new common_1.NotFoundException(`Rol con ID ${id} no encontrado`);
        }
        return rol;
    }
    async aplicarPermisosPorRol(usuarioId, rolId) {
        const rol = await this.findOneRol(rolId);
        const permisosPorRol = this.getPermisosPorRol(rol.nombre);
        const permisos = permisosPorRol.map((modulo) => ({
            modulo,
            tiene_acceso: true,
        }));
        await this.updatePermisos(usuarioId, permisos);
    }
    getPermisosPorRol(nombreRol) {
        const permisosPorRol = {
            admin: [
                'facturacion',
                'contabilidad',
                'clientes',
                'productos',
                'inventario',
                'compras',
                'admin',
                'reportes',
            ],
            'gestor de sistema': [
                'facturacion',
                'contabilidad',
                'clientes',
                'productos',
                'inventario',
                'compras',
                'admin',
                'reportes',
            ],
            gerente: [
                'facturacion',
                'contabilidad',
                'clientes',
                'productos',
                'inventario',
                'compras',
                'reportes',
            ],
            vendedor: [
                'facturacion',
                'clientes',
                'productos',
            ],
            contador: [
                'contabilidad',
                'facturacion',
                'reportes',
            ],
        };
        return permisosPorRol[nombreRol.toLowerCase()] || [];
    }
    async syncFirebaseUser(firebaseUid, email, nombreCompleto, extraData = {}) {
        let usuario = await this.usuarioRepository.findOne({
            where: { email },
        });
        if (usuario) {
            let updated = false;
            if (extraData.identificacion && usuario.identificacion !== extraData.identificacion) {
                usuario.identificacion = extraData.identificacion;
                updated = true;
            }
            if (extraData.telefono && usuario.telefono !== extraData.telefono) {
                usuario.telefono = extraData.telefono;
                updated = true;
            }
            if (extraData.direccion && usuario.direccion !== extraData.direccion) {
                usuario.direccion = extraData.direccion;
                updated = true;
            }
            if (extraData.fecha_nacimiento) {
                const nuevaFecha = new Date(extraData.fecha_nacimiento);
                if (usuario.fecha_nacimiento?.getTime() !== nuevaFecha.getTime()) {
                    usuario.fecha_nacimiento = nuevaFecha;
                    updated = true;
                }
            }
            if (extraData.foto_cedula_anverso) {
                usuario.foto_cedula_anverso = extraData.foto_cedula_anverso;
                updated = true;
            }
            if (extraData.foto_cedula_reverso) {
                usuario.foto_cedula_reverso = extraData.foto_cedula_reverso;
                updated = true;
            }
            if (updated) {
                await this.usuarioRepository.save(usuario);
            }
            return usuario;
        }
        else {
            const rolVendedor = await this.rolRepository.findOne({
                where: { nombre: 'vendedor' },
            });
            const nuevoUsuario = this.usuarioRepository.create({
                nombre_usuario: email.split('@')[0],
                nombre_completo: nombreCompleto,
                password: 'FIREBASE_AUTH',
                email,
                activo: 1,
                rol_id: rolVendedor?.id || 2,
                identificacion: extraData.identificacion,
                telefono: extraData.telefono,
                direccion: extraData.direccion,
                fecha_nacimiento: extraData.fecha_nacimiento ? new Date(extraData.fecha_nacimiento) : null,
                fecha_ingreso: new Date(),
                sueldo: extraData.sueldo || 460.00,
                foto_cedula_anverso: extraData.foto_cedula_anverso,
                foto_cedula_reverso: extraData.foto_cedula_reverso
            });
            const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
            if (rolVendedor) {
                await this.aplicarPermisosPorRol(usuarioGuardado.id, rolVendedor.id);
            }
            await this.auditService.create({
                accion: 'CREATE_USER_SYNC',
                modulo: 'USUARIOS',
                entidad_id: usuarioGuardado.id,
                valor_nuevo: usuarioGuardado,
                usuario_nombre: 'System',
                ip_address: '127.0.0.1'
            });
            return usuarioGuardado;
        }
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __param(2, (0, typeorm_1.InjectRepository)(usuario_permiso_entity_1.UsuarioPermiso)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => events_gateway_1.EventsGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        events_gateway_1.EventsGateway,
        audit_service_1.AuditService])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map