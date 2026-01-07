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
exports.CajaChicaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const caja_chica_movimiento_entity_1 = require("./entities/caja-chica-movimiento.entity");
let CajaChicaService = class CajaChicaService {
    constructor(cajaChicaRepository) {
        this.cajaChicaRepository = cajaChicaRepository;
    }
    async registrarMovimiento(createDto) {
        const saldoActual = await this.obtenerSaldoActual(createDto.punto_venta_id);
        const monto = Number(createDto.monto);
        let nuevoSaldo = 0;
        if (createDto.tipo === 'INGRESO') {
            nuevoSaldo = saldoActual + monto;
        }
        else {
            nuevoSaldo = saldoActual - monto;
        }
        const movimiento = this.cajaChicaRepository.create({
            ...createDto,
            monto: monto,
            saldo_resultante: nuevoSaldo
        });
        return await this.cajaChicaRepository.save(movimiento);
    }
    async obtenerSaldoActual(puntoVentaId) {
        const ultimoMovimiento = await this.cajaChicaRepository.findOne({
            where: { punto_venta_id: puntoVentaId },
            order: { id: 'DESC' }
        });
        return ultimoMovimiento ? Number(ultimoMovimiento.saldo_resultante) : 0;
    }
    async obtenerHistorial(puntoVentaId, fechaInicio, fechaFin) {
        const query = this.cajaChicaRepository.createQueryBuilder('movimiento')
            .leftJoinAndSelect('movimiento.usuario', 'usuario')
            .where('movimiento.punto_venta_id = :puntoVentaId', { puntoVentaId })
            .orderBy('movimiento.id', 'DESC');
        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            inicio.setHours(0, 0, 0, 0);
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);
            query.andWhere('movimiento.fecha BETWEEN :inicio AND :fin', { inicio, fin });
        }
        else {
            query.take(20);
        }
        return await query.getMany();
    }
};
exports.CajaChicaService = CajaChicaService;
exports.CajaChicaService = CajaChicaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(caja_chica_movimiento_entity_1.CajaChicaMovimiento)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CajaChicaService);
//# sourceMappingURL=caja-chica.service.js.map