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
exports.InsertarRolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rol_entity_1 = require("../entities/rol.entity");
let InsertarRolesService = class InsertarRolesService {
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }
    async onModuleInit() {
        let intentos = 0;
        const maxIntentos = 10;
        const intentarInsertar = async () => {
            try {
                await this.rolRepository.count();
                await this.insertarRolesPredefinidos();
            }
            catch (error) {
                intentos++;
                if (intentos < maxIntentos) {
                    console.log(`⏳ Esperando base de datos... (intento ${intentos}/${maxIntentos})`);
                    setTimeout(intentarInsertar, 1000 * intentos);
                }
                else {
                    console.error('❌ No se pudo conectar a la base de datos después de varios intentos');
                    console.error('   Los roles se crearán cuando la base de datos esté disponible');
                }
            }
        };
        setTimeout(intentarInsertar, 1000);
    }
    async insertarRolesPredefinidos() {
        const rolesPredefinidos = [
            {
                nombre: 'admin',
                descripcion: 'Administrador del sistema con acceso completo a todos los módulos',
            },
            {
                nombre: 'gestor de sistema',
                descripcion: 'Gestor de sistema con acceso completo para configuración y mantenimiento',
            },
            {
                nombre: 'gerente',
                descripcion: 'Gerente con acceso a módulos operativos y reportes',
            },
            {
                nombre: 'vendedor',
                descripcion: 'Vendedor con acceso a facturación, clientes y productos',
            },
            {
                nombre: 'contador',
                descripcion: 'Contador con acceso a contabilidad, facturación y reportes',
            },
            {
                nombre: 'Administrador de TI',
                descripcion: 'Administrador de TI con acceso exclusivo a operatividad técnica, sin acceso a información financiera',
            },
            {
                nombre: 'Dueño',
                descripcion: 'Dueño de la empresa con acceso completo y autorización para aprobar solicitudes de roles',
            },
        ];
        for (const rolData of rolesPredefinidos) {
            const existe = await this.rolRepository.findOne({
                where: { nombre: rolData.nombre },
            });
            if (!existe) {
                const rol = this.rolRepository.create(rolData);
                await this.rolRepository.save(rol);
                console.log(`✅ Rol "${rolData.nombre}" creado`);
            }
            else {
                console.log(`ℹ️  Rol "${rolData.nombre}" ya existe`);
            }
        }
    }
};
exports.InsertarRolesService = InsertarRolesService;
exports.InsertarRolesService = InsertarRolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InsertarRolesService);
//# sourceMappingURL=insertar-roles.service.js.map