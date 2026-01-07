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
exports.RecursosHumanosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const empleado_entity_1 = require("./entities/empleado.entity");
const asistencia_entity_1 = require("./entities/asistencia.entity");
const contabilidad_service_1 = require("../contabilidad/contabilidad.service");
let RecursosHumanosService = class RecursosHumanosService {
    constructor(empleadoRepository, asistenciaRepository, contabilidadService) {
        this.empleadoRepository = empleadoRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.contabilidadService = contabilidadService;
    }
    async generarRolPagos(periodo) {
        const empleados = await this.empleadoRepository.find({ where: { activo: true } });
        let totalIngresos = 0;
        for (const emp of empleados) {
            const sueldo = Number(emp.sueldo) || 460;
            totalIngresos += sueldo;
        }
        const totalAportePatronal = totalIngresos * 0.1215;
        const totalIessPersonal = totalIngresos * 0.0945;
        const totalPagar = totalIngresos - totalIessPersonal;
        const asiento = await this.contabilidadService.crearAsientoNomina({
            periodo,
            totalIngresos,
            totalAportePatronal,
            totalIessPersonal,
            totalPagar
        });
        return {
            mensaje: 'Rol de pagos generado y contabilizado exitosamente',
            detalles: {
                empleados: empleados.length,
                totalNomina: totalIngresos,
                asientoContable: asiento.numero_asiento
            }
        };
    }
    async findAllEmpleados() {
        return this.empleadoRepository.find({
            order: { nombre: 'ASC', apellido: 'ASC' },
        });
    }
    async createEmpleado(createDto) {
        const empleado = this.empleadoRepository.create({
            ...createDto,
            fecha_ingreso: createDto.fecha_ingreso ? new Date(createDto.fecha_ingreso) : new Date(),
            fecha_nacimiento: createDto.fecha_nacimiento ? new Date(createDto.fecha_nacimiento) : null,
        });
        return this.empleadoRepository.save(empleado);
    }
    async updateEmpleado(id, updateDto) {
        const empleado = await this.empleadoRepository.findOne({ where: { id } });
        if (!empleado) {
            throw new common_1.NotFoundException(`Empleado con ID ${id} no encontrado`);
        }
        Object.assign(empleado, {
            ...updateDto,
            fecha_ingreso: updateDto.fecha_ingreso ? new Date(updateDto.fecha_ingreso) : empleado.fecha_ingreso,
            fecha_nacimiento: updateDto.fecha_nacimiento ? new Date(updateDto.fecha_nacimiento) : empleado.fecha_nacimiento,
        });
        return this.empleadoRepository.save(empleado);
    }
    async removeEmpleado(id) {
        const empleado = await this.empleadoRepository.findOne({ where: { id } });
        if (!empleado) {
            throw new common_1.NotFoundException(`Empleado con ID ${id} no encontrado`);
        }
        await this.empleadoRepository.remove(empleado);
        return { message: 'Empleado eliminado exitosamente' };
    }
    async findAllAsistencias() {
        return this.asistenciaRepository.find({
            relations: ['empleado'],
            order: { fecha: 'DESC', id: 'DESC' },
        });
    }
    async createAsistencia(createDto) {
        const asistencia = this.asistenciaRepository.create({
            ...createDto,
            fecha: createDto.fecha ? new Date(createDto.fecha) : new Date(),
        });
        return this.asistenciaRepository.save(asistencia);
    }
};
exports.RecursosHumanosService = RecursosHumanosService;
exports.RecursosHumanosService = RecursosHumanosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(empleado_entity_1.Empleado)),
    __param(1, (0, typeorm_1.InjectRepository)(asistencia_entity_1.Asistencia)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        contabilidad_service_1.ContabilidadService])
], RecursosHumanosService);
//# sourceMappingURL=recursos-humanos.service.js.map