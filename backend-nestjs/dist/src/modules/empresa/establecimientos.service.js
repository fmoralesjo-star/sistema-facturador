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
exports.EstablecimientosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const establecimiento_entity_1 = require("./entities/establecimiento.entity");
let EstablecimientosService = class EstablecimientosService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(data) {
        if (!data.codigo || data.codigo.length !== 3) {
            throw new common_1.BadRequestException('El código debe tener 3 dígitos');
        }
        const existing = await this.repo.findOne({ where: { codigo: data.codigo } });
        if (existing) {
            throw new common_1.BadRequestException('Ya existe un establecimiento con este código');
        }
        const establecimiento = this.repo.create(data);
        return await this.repo.save(establecimiento);
    }
    async findAll() {
        return await this.repo.find({
            order: { codigo: 'ASC' },
            relations: ['puntosEmision']
        });
    }
    async findOne(id) {
        const est = await this.repo.findOne({
            where: { id },
            relations: ['puntosEmision']
        });
        if (!est)
            throw new common_1.NotFoundException('Establecimiento no encontrado');
        return est;
    }
    async update(id, data) {
        const est = await this.findOne(id);
        Object.assign(est, data);
        return await this.repo.save(est);
    }
    async remove(id) {
        const est = await this.findOne(id);
        est.activo = false;
        return await this.repo.save(est);
    }
};
exports.EstablecimientosService = EstablecimientosService;
exports.EstablecimientosService = EstablecimientosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(establecimiento_entity_1.Establecimiento)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EstablecimientosService);
//# sourceMappingURL=establecimientos.service.js.map