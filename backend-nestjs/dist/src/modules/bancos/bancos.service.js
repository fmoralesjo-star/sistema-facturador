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
exports.BancosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const banco_entity_1 = require("./entities/banco.entity");
let BancosService = class BancosService {
    constructor(bancoRepository) {
        this.bancoRepository = bancoRepository;
    }
    async create(createBancoDto) {
        const banco = this.bancoRepository.create({
            ...createBancoDto,
            saldo_actual: createBancoDto.saldo_inicial || 0,
        });
        return this.bancoRepository.save(banco);
    }
    async findAll() {
        return this.bancoRepository.find({
            where: { activo: true },
            order: { nombre: 'ASC' },
        });
    }
    async findOne(id) {
        return this.bancoRepository.findOne({
            where: { id },
            relations: ['conciliaciones'],
        });
    }
    async update(id, updateData) {
        await this.bancoRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.bancoRepository.update(id, { activo: false });
    }
    async actualizarSaldo(bancoId, monto, tipo) {
        const banco = await this.findOne(bancoId);
        if (tipo === 'suma') {
            banco.saldo_actual = Number(banco.saldo_actual) + monto;
        }
        else {
            banco.saldo_actual = Math.max(0, Number(banco.saldo_actual) - monto);
        }
        await this.bancoRepository.save(banco);
    }
};
exports.BancosService = BancosService;
exports.BancosService = BancosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(banco_entity_1.Banco)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BancosService);
//# sourceMappingURL=bancos.service.js.map