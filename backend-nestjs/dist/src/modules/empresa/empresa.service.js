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
exports.EmpresaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const empresa_entity_1 = require("./entities/empresa.entity");
let EmpresaService = class EmpresaService {
    constructor(empresaRepository) {
        this.empresaRepository = empresaRepository;
    }
    async create(createEmpresaDto) {
        const empresaExistente = await this.empresaRepository.findOne({
            where: { ruc: createEmpresaDto.ruc },
        });
        if (empresaExistente) {
            throw new common_1.BadRequestException(`Ya existe una empresa con el RUC ${createEmpresaDto.ruc}`);
        }
        const empresa = this.empresaRepository.create(createEmpresaDto);
        return this.empresaRepository.save(empresa);
    }
    async findAll() {
        return this.empresaRepository.find({
            order: { razon_social: 'ASC' },
        });
    }
    async findActive() {
        return this.empresaRepository.findOne({
            where: { activa: true },
        });
    }
    async findOne(id) {
        const empresa = await this.empresaRepository.findOne({ where: { id } });
        if (!empresa) {
            throw new common_1.NotFoundException(`Empresa con ID ${id} no encontrada`);
        }
        return empresa;
    }
    async findByRuc(ruc) {
        return this.empresaRepository.findOne({ where: { ruc } });
    }
    async update(id, updateEmpresaDto) {
        const empresa = await this.findOne(id);
        if (updateEmpresaDto.ruc && updateEmpresaDto.ruc !== empresa.ruc) {
            const empresaExistente = await this.findByRuc(updateEmpresaDto.ruc);
            if (empresaExistente && empresaExistente.id !== id) {
                throw new common_1.BadRequestException(`Ya existe otra empresa con el RUC ${updateEmpresaDto.ruc}`);
            }
        }
        const dtoToUpdate = { ...updateEmpresaDto };
        if (dtoToUpdate.direccion && !dtoToUpdate.direccion_matriz) {
            dtoToUpdate.direccion_matriz = dtoToUpdate.direccion;
        }
        delete dtoToUpdate.direccion;
        this.empresaRepository.merge(empresa, dtoToUpdate);
        return this.empresaRepository.save(empresa);
    }
    async remove(id) {
        const empresa = await this.findOne(id);
        await this.empresaRepository.remove(empresa);
    }
    async activate(id) {
        const empresa = await this.findOne(id);
        empresa.activa = true;
        return this.empresaRepository.save(empresa);
    }
    async deactivate(id) {
        const empresa = await this.findOne(id);
        empresa.activa = false;
        return this.empresaRepository.save(empresa);
    }
};
exports.EmpresaService = EmpresaService;
exports.EmpresaService = EmpresaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(empresa_entity_1.Empresa)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmpresaService);
//# sourceMappingURL=empresa.service.js.map