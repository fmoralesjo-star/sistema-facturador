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
exports.ParametrosSriService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const impuesto_iva_entity_1 = require("./entities/impuesto-iva.entity");
const retencion_sri_entity_1 = require("./entities/retencion-sri.entity");
const sustento_tributario_entity_1 = require("./entities/sustento-tributario.entity");
let ParametrosSriService = class ParametrosSriService {
    constructor(ivaRepo, retencionRepo, sustentoRepo) {
        this.ivaRepo = ivaRepo;
        this.retencionRepo = retencionRepo;
        this.sustentoRepo = sustentoRepo;
    }
    async findAllIva() {
        return await this.ivaRepo.find({ order: { codigo: 'ASC' } });
    }
    async createIva(data) {
        const doc = this.ivaRepo.create(data);
        return await this.ivaRepo.save(doc);
    }
    async toggleIva(id) {
        const doc = await this.ivaRepo.findOne({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException('Impuesto no encontrado');
        doc.activo = !doc.activo;
        return await this.ivaRepo.save(doc);
    }
    async findAllRetenciones() {
        return await this.retencionRepo.find({ order: { codigo: 'ASC' } });
    }
    async createRetencion(data) {
        const doc = this.retencionRepo.create(data);
        return await this.retencionRepo.save(doc);
    }
    async toggleRetencion(id) {
        const doc = await this.retencionRepo.findOne({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException('Retención no encontrada');
        doc.activo = !doc.activo;
        return await this.retencionRepo.save(doc);
    }
    async findAllSustento() {
        return await this.sustentoRepo.find({ order: { codigo: 'ASC' } });
    }
    async createSustento(data) {
        const doc = this.sustentoRepo.create(data);
        return await this.sustentoRepo.save(doc);
    }
};
exports.ParametrosSriService = ParametrosSriService;
exports.ParametrosSriService = ParametrosSriService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(impuesto_iva_entity_1.ImpuestoIVA)),
    __param(1, (0, typeorm_1.InjectRepository)(retencion_sri_entity_1.RetencionSRI)),
    __param(2, (0, typeorm_1.InjectRepository)(sustento_tributario_entity_1.SustentoTributario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ParametrosSriService);
//# sourceMappingURL=parametros-sri.service.js.map