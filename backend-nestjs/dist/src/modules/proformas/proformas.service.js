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
exports.ProformasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const proforma_entity_1 = require("./entities/proforma.entity");
const proforma_detalle_entity_1 = require("./entities/proforma-detalle.entity");
let ProformasService = class ProformasService {
    constructor(proformasRepository, detallesRepository) {
        this.proformasRepository = proformasRepository;
        this.detallesRepository = detallesRepository;
    }
    async create(createProformaDto) {
        const lastProforma = await this.proformasRepository.find({
            order: { id: 'DESC' },
            take: 1
        });
        let nextNum = 1;
        if (lastProforma.length > 0) {
            const lastNumStr = lastProforma[0].numero.split('-')[1];
            if (lastNumStr && !isNaN(parseInt(lastNumStr))) {
                nextNum = parseInt(lastNumStr) + 1;
            }
        }
        const numero = `PROF-${nextNum.toString().padStart(6, '0')}`;
        const proforma = this.proformasRepository.create({
            ...createProformaDto,
            numero,
            detalles: createProformaDto.detalles.map(d => this.detallesRepository.create(d))
        });
        return await this.proformasRepository.save(proforma);
    }
    async findAll(query) {
        const { fechaInicio, fechaFin, cliente, numero } = query;
        const where = {};
        if (fechaInicio && fechaFin) {
            where.fecha = (0, typeorm_2.Between)(fechaInicio, fechaFin);
        }
        if (numero) {
            where.numero = (0, typeorm_2.Like)(`%${numero}%`);
        }
        return await this.proformasRepository.find({
            where,
            order: { id: 'DESC' },
            relations: ['detalles', 'cliente']
        });
    }
    async findOne(id) {
        const proforma = await this.proformasRepository.findOne({
            where: { id },
            relations: ['detalles', 'cliente']
        });
        if (!proforma)
            throw new common_1.NotFoundException(`Proforma #${id} not found`);
        return proforma;
    }
};
exports.ProformasService = ProformasService;
exports.ProformasService = ProformasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(proforma_entity_1.Proforma)),
    __param(1, (0, typeorm_1.InjectRepository)(proforma_detalle_entity_1.ProformaDetalle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProformasService);
//# sourceMappingURL=proformas.service.js.map