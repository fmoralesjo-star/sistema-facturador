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
exports.PromocionesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promocion_entity_1 = require("./entities/promocion.entity");
let PromocionesService = class PromocionesService {
    constructor(promocionRepository) {
        this.promocionRepository = promocionRepository;
    }
    async findAll() {
        return this.promocionRepository.find({
            relations: ['producto'],
            order: { fecha_inicio: 'DESC', id: 'DESC' },
        });
    }
    async create(createDto) {
        const promocion = this.promocionRepository.create({
            ...createDto,
            fecha_inicio: createDto.fecha_inicio ? new Date(createDto.fecha_inicio) : new Date(),
            fecha_fin: createDto.fecha_fin ? new Date(createDto.fecha_fin) : null,
            dias_semana: createDto.dias_semana ? JSON.stringify(createDto.dias_semana) : null,
            usos_actuales: 0,
        });
        return this.promocionRepository.save(promocion);
    }
    async findOne(id) {
        const promocion = await this.promocionRepository.findOne({
            where: { id },
            relations: ['producto'],
        });
        if (!promocion) {
            throw new common_1.NotFoundException(`Promoción con ID ${id} no encontrada`);
        }
        return promocion;
    }
    async update(id, updateDto) {
        const promocion = await this.promocionRepository.findOne({ where: { id } });
        if (!promocion) {
            throw new common_1.NotFoundException(`Promoción con ID ${id} no encontrada`);
        }
        Object.assign(promocion, {
            ...updateDto,
            fecha_inicio: updateDto.fecha_inicio ? new Date(updateDto.fecha_inicio) : promocion.fecha_inicio,
            fecha_fin: updateDto.fecha_fin ? new Date(updateDto.fecha_fin) : promocion.fecha_fin,
            dias_semana: updateDto.dias_semana ? JSON.stringify(updateDto.dias_semana) : promocion.dias_semana,
        });
        return this.promocionRepository.save(promocion);
    }
    async remove(id) {
        const promocion = await this.promocionRepository.findOne({ where: { id } });
        if (!promocion) {
            throw new common_1.NotFoundException(`Promoción con ID ${id} no encontrada`);
        }
        await this.promocionRepository.remove(promocion);
        return { message: 'Promoción eliminada exitosamente' };
    }
    async findActivasPorProducto(productoId) {
        const ahora = new Date();
        return this.promocionRepository.find({
            where: [
                { producto_id: productoId, estado: 'activa' },
                { producto_id: null, estado: 'activa' },
            ],
            relations: ['producto'],
        }).then(promociones => {
            return promociones.filter(p => {
                const fechaInicio = new Date(p.fecha_inicio);
                const fechaFin = p.fecha_fin ? new Date(p.fecha_fin) : null;
                if (ahora < fechaInicio)
                    return false;
                if (fechaFin && ahora > fechaFin)
                    return false;
                if (p.dias_semana) {
                    try {
                        const dias = JSON.parse(p.dias_semana);
                        const diaActual = ahora.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
                        if (dias.length > 0 && !dias.includes(diaActual))
                            return false;
                    }
                    catch (e) {
                    }
                }
                if (p.maximo_usos && p.usos_actuales >= p.maximo_usos)
                    return false;
                return true;
            });
        });
    }
};
exports.PromocionesService = PromocionesService;
exports.PromocionesService = PromocionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(promocion_entity_1.Promocion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PromocionesService);
//# sourceMappingURL=promociones.service.js.map