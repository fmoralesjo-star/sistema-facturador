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
var LiquidacionesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidacionesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const liquidacion_compra_entity_1 = require("../entities/liquidacion-compra.entity");
let LiquidacionesService = LiquidacionesService_1 = class LiquidacionesService {
    constructor(liquidacionRepository) {
        this.liquidacionRepository = liquidacionRepository;
        this.logger = new common_1.Logger(LiquidacionesService_1.name);
    }
    async create(createDto) {
        try {
            const secuencial = await this.obtenerSiguienteSecuencial();
            const liquidacion = this.liquidacionRepository.create({
                ...createDto,
                secuencial,
                estado: 'PENDIENTE',
            });
            const liquidacionGuardada = await this.liquidacionRepository.save(liquidacion);
            this.logger.log(`Liquidación creada: ${liquidacionGuardada.id}`);
            return liquidacionGuardada;
        }
        catch (error) {
            this.logger.error('Error al crear liquidación', error);
            throw error;
        }
    }
    async findAll(filtros) {
        const query = this.liquidacionRepository.createQueryBuilder('liquidacion');
        if (filtros?.desde && filtros?.hasta) {
            query.andWhere('liquidacion.fecha_emision BETWEEN :desde AND :hasta', {
                desde: filtros.desde,
                hasta: filtros.hasta,
            });
        }
        if (filtros?.estado) {
            query.andWhere('liquidacion.estado = :estado', { estado: filtros.estado });
        }
        query.orderBy('liquidacion.fecha_emision', 'DESC');
        return await query.getMany();
    }
    async findOne(id) {
        const liquidacion = await this.liquidacionRepository.findOne({ where: { id } });
        if (!liquidacion) {
            throw new common_1.NotFoundException(`Liquidación con ID ${id} no encontrada`);
        }
        return liquidacion;
    }
    async anular(id) {
        const liquidacion = await this.findOne(id);
        if (liquidacion.estado === 'ANULADA') {
            throw new Error('La liquidación ya está anulada');
        }
        liquidacion.estado = 'ANULADA';
        await this.liquidacionRepository.save(liquidacion);
        this.logger.log(`Liquidación ${id} anulada`);
        return liquidacion;
    }
    async obtenerSiguienteSecuencial() {
        const ultima = await this.liquidacionRepository
            .createQueryBuilder('liquidacion')
            .orderBy('liquidacion.id', 'DESC')
            .getOne();
        if (!ultima) {
            return '000000001';
        }
        const siguienteNumero = parseInt(ultima.secuencial) + 1;
        return siguienteNumero.toString().padStart(9, '0');
    }
};
exports.LiquidacionesService = LiquidacionesService;
exports.LiquidacionesService = LiquidacionesService = LiquidacionesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(liquidacion_compra_entity_1.LiquidacionCompra)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LiquidacionesService);
//# sourceMappingURL=liquidaciones.service.js.map