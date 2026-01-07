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
exports.CrearUsuariosPruebaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_1 = require("../entities/usuario.entity");
const rol_entity_1 = require("../entities/rol.entity");
const usuario_permiso_entity_1 = require("../entities/usuario-permiso.entity");
let CrearUsuariosPruebaService = class CrearUsuariosPruebaService {
    constructor(usuarioRepository, rolRepository, permisoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.permisoRepository = permisoRepository;
    }
    async onModuleInit() {
        let intentos = 0;
        const maxIntentos = 15;
        const intentarCrear = async () => {
            try {
                const rolesCount = await this.rolRepository.count();
                if (rolesCount > 0) {
                    await this.crearUsuariosPrueba();
                }
                else {
                    intentos++;
                    if (intentos < maxIntentos) {
                        setTimeout(intentarCrear, 2000);
                    }
                    else {
                        console.warn('⚠️  No se encontraron roles después de varios intentos');
                        console.warn('   Los usuarios de prueba se crearán cuando los roles estén disponibles');
                    }
                }
            }
            catch (error) {
                intentos++;
                if (intentos < maxIntentos) {
                    setTimeout(intentarCrear, 2000);
                }
                else {
                    console.error('❌ Error al crear usuarios de prueba:', error.message);
                }
            }
        };
        setTimeout(intentarCrear, 5000);
    }
    async crearUsuariosPrueba() {
        const usuariosPrueba = [
            {
                nombre_usuario: 'admin',
                nombre_completo: 'Administrador del Sistema',
                password: 'admin123',
                email: 'admin@sistema.com',
                activo: 1,
                rol_nombre: 'admin',
            },
            {
                nombre_usuario: 'gestor',
                nombre_completo: 'Gestor de Sistema',
                password: 'gestor123',
                email: 'gestor@sistema.com',
                activo: 1,
                rol_nombre: 'gestor de sistema',
            },
            {
                nombre_usuario: 'gerente',
                nombre_completo: 'Gerente General',
                password: 'gerente123',
                email: 'gerente@sistema.com',
                activo: 1,
                rol_nombre: 'gerente',
            },
            {
                nombre_usuario: 'vendedor1',
                nombre_completo: 'Vendedor Principal',
                password: 'vendedor123',
                email: 'vendedor1@sistema.com',
                activo: 1,
                rol_nombre: 'vendedor',
            },
            {
                nombre_usuario: 'vendedor2',
                nombre_completo: 'Vendedor Secundario',
                password: 'vendedor123',
                email: 'vendedor2@sistema.com',
                activo: 1,
                rol_nombre: 'vendedor',
            },
            {
                nombre_usuario: 'contador',
                nombre_completo: 'Contador General',
                password: 'contador123',
                email: 'contador@sistema.com',
                activo: 1,
                rol_nombre: 'contador',
            },
        ];
        let bcrypt;
        try {
            bcrypt = require('bcrypt');
        }
        catch (e) {
            console.warn('⚠️  bcrypt no está instalado. Usando hash temporal.');
            bcrypt = {
                hash: async (password) => password,
            };
        }
        for (const usuarioData of usuariosPrueba) {
            try {
                const existe = await this.usuarioRepository.findOne({
                    where: { nombre_usuario: usuarioData.nombre_usuario },
                });
                if (existe) {
                    console.log(`ℹ️  Usuario "${usuarioData.nombre_usuario}" ya existe`);
                    continue;
                }
                const rol = await this.rolRepository.findOne({
                    where: { nombre: usuarioData.rol_nombre },
                });
                if (!rol) {
                    console.warn(`⚠️  Rol "${usuarioData.rol_nombre}" no encontrado para usuario "${usuarioData.nombre_usuario}"`);
                    continue;
                }
                const hashedPassword = await bcrypt.hash(usuarioData.password, 10);
                const usuario = this.usuarioRepository.create({
                    nombre_usuario: usuarioData.nombre_usuario,
                    nombre_completo: usuarioData.nombre_completo,
                    password: hashedPassword,
                    email: usuarioData.email,
                    activo: usuarioData.activo,
                    rol_id: rol.id,
                });
                const usuarioGuardado = await this.usuarioRepository.save(usuario);
                await this.aplicarPermisosPorRol(usuarioGuardado.id, rol.nombre);
                console.log(`✅ Usuario de prueba "${usuarioData.nombre_usuario}" creado con rol "${rol.nombre}"`);
            }
            catch (error) {
                console.error(`❌ Error al crear usuario "${usuarioData.nombre_usuario}":`, error.message);
            }
        }
        console.log('');
        console.log('========================================');
        console.log('   USUARIOS DE PRUEBA CREADOS');
        console.log('========================================');
        console.log('');
        console.log('Credenciales de acceso:');
        console.log('');
        usuariosPrueba.forEach((u) => {
            console.log(`  Usuario: ${u.nombre_usuario.padEnd(15)} Contraseña: ${u.password.padEnd(15)} Rol: ${u.rol_nombre}`);
        });
        console.log('');
    }
    async aplicarPermisosPorRol(usuarioId, nombreRol) {
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
        const modulos = permisosPorRol[nombreRol.toLowerCase()] || [];
        await this.permisoRepository.delete({ usuario_id: usuarioId });
        const permisos = modulos.map((modulo) => this.permisoRepository.create({
            usuario_id: usuarioId,
            modulo,
            tiene_acceso: 1,
        }));
        if (permisos.length > 0) {
            await this.permisoRepository.save(permisos);
        }
    }
};
exports.CrearUsuariosPruebaService = CrearUsuariosPruebaService;
exports.CrearUsuariosPruebaService = CrearUsuariosPruebaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __param(2, (0, typeorm_1.InjectRepository)(usuario_permiso_entity_1.UsuarioPermiso)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CrearUsuariosPruebaService);
//# sourceMappingURL=crear-usuarios-prueba.service.js.map