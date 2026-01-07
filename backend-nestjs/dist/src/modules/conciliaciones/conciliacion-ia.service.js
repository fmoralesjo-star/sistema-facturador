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
var ConciliacionIAService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConciliacionIAService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaccion_bancaria_entity_1 = require("./entities/transaccion-bancaria.entity");
const conciliacion_bancaria_entity_1 = require("./entities/conciliacion-bancaria.entity");
let ConciliacionIAService = ConciliacionIAService_1 = class ConciliacionIAService {
    constructor(transaccionRepo, conciliacionRepo) {
        this.transaccionRepo = transaccionRepo;
        this.conciliacionRepo = conciliacionRepo;
        this.logger = new common_1.Logger(ConciliacionIAService_1.name);
    }
    async procesarExtracto(data, bancoId) {
        const transacciones = [];
        for (const row of data) {
            const transaccion = this.transaccionRepo.create({
                banco_id: bancoId,
                fecha: new Date(row.fecha),
                referencia: row.referencia || '',
                descripcion: row.descripcion || '',
                tipo: row.tipo || (row.monto > 0 ? 'CREDITO' : 'DEBITO'),
                monto: Math.abs(parseFloat(row.monto)),
                saldo: parseFloat(row.saldo || 0),
                estado: 'PENDIENTE',
            });
            const saved = await this.transaccionRepo.save(transaccion);
            transacciones.push(saved);
        }
        this.logger.log(`Procesadas ${transacciones.length} transacciones bancarias`);
        return transacciones;
    }
    async getPendientes(bancoId) {
        const query = { estado: 'PENDIENTE' };
        if (bancoId)
            query.banco_id = bancoId;
        return await this.transaccionRepo.find({
            where: query,
            order: { fecha: 'DESC' }
        });
    }
    async sugerirEmparejamientos(transaccionId) {
        const transaccion = await this.transaccionRepo.findOne({ where: { id: transaccionId } });
        if (!transaccion) {
            throw new Error('Transacción no encontrada');
        }
        const candidatos = await this.buscarCandidatos(transaccion);
        const matches = this.calcularMatches(transaccion, candidatos);
        return matches.sort((a, b) => b.score - a.score);
    }
    async buscarCandidatos(transaccion) {
        const fechaInicio = new Date(transaccion.fecha);
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        const fechaFin = new Date(transaccion.fecha);
        fechaFin.setDate(fechaFin.getDate() + 7);
        return await this.conciliacionRepo
            .createQueryBuilder('c')
            .where('c.banco_id = :bancoId', { bancoId: transaccion.banco_id })
            .andWhere('c.fecha BETWEEN :inicio AND :fin', {
            inicio: fechaInicio,
            fin: fechaFin
        })
            .andWhere('c.conciliado = :conciliado', { conciliado: false })
            .getMany();
    }
    calcularMatches(transaccion, candidatos) {
        return candidatos.map(candidato => {
            let score = 0;
            const razones = [];
            const diffMonto = Math.abs(candidato.monto - transaccion.monto);
            if (diffMonto < 0.01) {
                score += 0.4;
                razones.push('✓ Monto exacto');
            }
            else if (diffMonto / transaccion.monto < 0.01) {
                score += 0.3;
                razones.push('≈ Monto muy similar');
            }
            else if (diffMonto / transaccion.monto < 0.05) {
                score += 0.2;
                razones.push('~ Monto similar');
            }
            const diffDias = Math.abs((new Date(candidato.fecha).getTime() - new Date(transaccion.fecha).getTime())
                / (1000 * 60 * 60 * 24));
            if (diffDias === 0) {
                score += 0.3;
                razones.push('✓ Misma fecha');
            }
            else if (diffDias === 1) {
                score += 0.25;
                razones.push('≈ 1 día de diferencia');
            }
            else if (diffDias <= 2) {
                score += 0.20;
                razones.push(`~ ${Math.round(diffDias)} días de diferencia`);
            }
            else if (diffDias <= 3) {
                score += 0.15;
                razones.push(`~ ${Math.round(diffDias)} días de diferencia`);
            }
            const similarity = this.calcularSimilitudTexto(transaccion.descripcion, candidato.descripcion || '');
            if (similarity > 0.7) {
                score += 0.3;
                razones.push('✓ Descripción muy similar');
            }
            else if (similarity > 0.5) {
                score += 0.2;
                razones.push('≈ Descripción similar');
            }
            else if (similarity > 0.3) {
                score += 0.1;
                razones.push('~ Algo de coincidencia en descripción');
            }
            if (candidato.tipo === transaccion.tipo) {
                score += 0.05;
                razones.push('✓ Mismo tipo de movimiento');
            }
            return {
                conciliacion: candidato,
                score,
                razones: razones.length > 0 ? razones : ['Sin coincidencias significativas']
            };
        }).filter(m => m.score > 0.2);
    }
    calcularSimilitudTexto(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        const palabras1 = s1.split(/\s+/).filter(p => p.length > 3);
        const palabras2 = s2.split(/\s+/).filter(p => p.length > 3);
        if (palabras1.length === 0 || palabras2.length === 0) {
            return 0;
        }
        const comunes = palabras1.filter(p => palabras2.includes(p)).length;
        const total = Math.max(palabras1.length, palabras2.length);
        return comunes / total;
    }
    async confirmarEmparejamiento(transaccionId, conciliacionId) {
        const transaccion = await this.transaccionRepo.findOne({ where: { id: transaccionId } });
        const conciliacion = await this.conciliacionRepo.findOne({ where: { id: conciliacionId } });
        if (!transaccion || !conciliacion) {
            throw new Error('Transacción o conciliación no encontrada');
        }
        transaccion.estado = 'CONCILIADA';
        transaccion.conciliacion_id = conciliacionId;
        await this.transaccionRepo.save(transaccion);
        conciliacion.conciliado = true;
        await this.conciliacionRepo.save(conciliacion);
        this.logger.log(`Transacción ${transaccionId} emparejada con conciliación ${conciliacionId}`);
        return transaccion;
    }
    async getEstadisticas(bancoId) {
        const query = {};
        if (bancoId)
            query.banco_id = bancoId;
        const total = await this.transaccionRepo.count({ where: query });
        const pendientes = await this.transaccionRepo.count({
            where: { ...query, estado: 'PENDIENTE' }
        });
        const conciliadas = await this.transaccionRepo.count({
            where: { ...query, estado: 'CONCILIADA' }
        });
        return {
            total,
            pendientes,
            conciliadas,
            porcentajeConciliado: total > 0 ? (conciliadas / total * 100).toFixed(1) : 0
        };
    }
};
exports.ConciliacionIAService = ConciliacionIAService;
exports.ConciliacionIAService = ConciliacionIAService = ConciliacionIAService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaccion_bancaria_entity_1.TransaccionBancaria)),
    __param(1, (0, typeorm_1.InjectRepository)(conciliacion_bancaria_entity_1.ConciliacionBancaria)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ConciliacionIAService);
//# sourceMappingURL=conciliacion-ia.service.js.map