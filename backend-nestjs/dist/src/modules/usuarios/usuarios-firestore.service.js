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
exports.UsuariosFirestoreService = void 0;
const common_1 = require("@nestjs/common");
const firestore_service_1 = require("../firebase/firestore.service");
const events_gateway_1 = require("../../gateways/events.gateway");
let UsuariosFirestoreService = class UsuariosFirestoreService {
    constructor(firestoreService, eventsGateway) {
        this.firestoreService = firestoreService;
        this.eventsGateway = eventsGateway;
        this.usuariosCollection = 'usuarios';
        this.rolesCollection = 'roles';
        this.permisosCollection = 'usuario_permisos';
    }
    async findAllRoles() {
        if (!this.firestoreService.isAvailable()) {
            return this.getRolesDefault();
        }
        const roles = await this.firestoreService.findAll(this.rolesCollection, undefined, { field: 'nombre', direction: 'asc' });
        if (roles.length === 0) {
            return await this.crearRolesDefault();
        }
        return roles;
    }
    async findOneRol(id) {
        if (!this.firestoreService.isAvailable()) {
            return null;
        }
        return await this.firestoreService.findOne(this.rolesCollection, id);
    }
    getRolesDefault() {
        return [
            { id: '1', nombre: 'admin', descripcion: 'Administrador del sistema' },
            { id: '2', nombre: 'gestor de sistema', descripcion: 'Gestor de sistema' },
            { id: '3', nombre: 'gerente', descripcion: 'Gerente' },
            { id: '4', nombre: 'vendedor', descripcion: 'Vendedor' },
            { id: '5', nombre: 'contador', descripcion: 'Contador' },
            { id: '6', nombre: 'Administrador de TI', descripcion: 'Administrador de TI' },
            { id: '7', nombre: 'Dueño', descripcion: 'Dueño de la empresa' },
        ];
    }
    async crearRolesDefault() {
        const rolesDefault = this.getRolesDefault();
        const rolesCreados = [];
        for (const rol of rolesDefault) {
            try {
                const rolExistente = await this.firestoreService.findByField(this.rolesCollection, 'nombre', rol.nombre);
                if (rolExistente.length === 0) {
                    const id = await this.firestoreService.create(this.rolesCollection, {
                        nombre: rol.nombre,
                        descripcion: rol.descripcion,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                    rolesCreados.push({ id, ...rol });
                }
                else {
                    rolesCreados.push({ id: rolExistente[0].id, ...rolExistente[0] });
                }
            }
            catch (error) {
                console.error(`Error al crear rol ${rol.nombre}:`, error);
            }
        }
        return rolesCreados;
    }
    async findAll() {
        if (!this.firestoreService.isAvailable()) {
            return [];
        }
        return await this.firestoreService.findAll(this.usuariosCollection, undefined, { field: 'nombre_completo', direction: 'asc' });
    }
    async findOne(id) {
        if (!this.firestoreService.isAvailable()) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const usuario = await this.firestoreService.findOne(this.usuariosCollection, id);
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return usuario;
    }
    async findByEmail(email) {
        if (!this.firestoreService.isAvailable()) {
            return null;
        }
        const usuarios = await this.firestoreService.findByField(this.usuariosCollection, 'email', email);
        return usuarios.length > 0 ? usuarios[0] : null;
    }
    async create(data) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        if (data.email) {
            const existente = await this.findByEmail(data.email);
            if (existente) {
                throw new Error('El email ya está en uso');
            }
        }
        const usuarioData = {
            ...data,
            activo: data.activo ?? 1,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const id = await this.firestoreService.create(this.usuariosCollection, usuarioData);
        if (this.eventsGateway) {
            this.eventsGateway.emitUsuarioCreado({ id, ...usuarioData });
        }
        return { id, ...usuarioData };
    }
    async update(id, data) {
        if (!this.firestoreService.isAvailable()) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const usuario = await this.findOne(id);
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        if (data.email && data.email !== usuario.email) {
            const existente = await this.findByEmail(data.email);
            if (existente) {
                throw new Error('El email ya está en uso');
            }
        }
        const updatedData = {
            ...data,
            updated_at: new Date(),
        };
        await this.firestoreService.update(this.usuariosCollection, id, updatedData);
        if (this.eventsGateway) {
            this.eventsGateway.emitUsuarioActualizado({ id, ...updatedData });
        }
        return { id, ...usuario, ...updatedData };
    }
    async remove(id) {
        if (!this.firestoreService.isAvailable()) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const usuario = await this.findOne(id);
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        await this.firestoreService.delete(this.usuariosCollection, id);
        if (this.eventsGateway) {
            this.eventsGateway.emitUsuarioEliminado(id);
        }
        return { id };
    }
    async getPermisos(usuarioId) {
        if (!this.firestoreService.isAvailable()) {
            return [];
        }
        const permisos = await this.firestoreService.findByField(this.permisosCollection, 'usuario_id', usuarioId);
        return permisos;
    }
    async updatePermisos(usuarioId, permisos) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        const permisosExistentes = await this.getPermisos(usuarioId);
        for (const permiso of permisosExistentes) {
            await this.firestoreService.delete(this.permisosCollection, permiso.id);
        }
        for (const permiso of permisos) {
            await this.firestoreService.create(this.permisosCollection, {
                usuario_id: usuarioId,
                modulo: permiso.modulo,
                tiene_acceso: permiso.tiene_acceso ? 1 : 0,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
        return permisos;
    }
    async syncFirebaseUser(firebase_uid, email, nombre_completo) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        let usuario = await this.findByEmail(email);
        if (usuario) {
            if (!usuario.firebase_uid) {
                await this.update(usuario.id, {
                    firebase_uid,
                    nombre_completo: nombre_completo || usuario.nombre_completo,
                });
                return { id: usuario.id, ...usuario, firebase_uid };
            }
            return usuario;
        }
        else {
            return await this.create({
                firebase_uid,
                email,
                nombre_completo,
                nombre_usuario: email,
                activo: 1,
            });
        }
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
                'clientes',
                'productos',
                'inventario',
                'compras',
                'admin',
                'reportes',
            ],
            gerente: [
                'facturacion',
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
                'reportes',
            ],
            'Administrador de TI': [
                'admin',
            ],
            'Dueño': [
                'facturacion',
                'contabilidad',
                'clientes',
                'productos',
                'inventario',
                'compras',
                'admin',
                'reportes',
            ],
        };
        return permisosPorRol[nombreRol] || [];
    }
};
exports.UsuariosFirestoreService = UsuariosFirestoreService;
exports.UsuariosFirestoreService = UsuariosFirestoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => events_gateway_1.EventsGateway))),
    __metadata("design:paramtypes", [firestore_service_1.FirestoreService,
        events_gateway_1.EventsGateway])
], UsuariosFirestoreService);
//# sourceMappingURL=usuarios-firestore.service.js.map