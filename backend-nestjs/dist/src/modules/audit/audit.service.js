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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const system_log_entity_1 = require("./entities/system-log.entity");
let AuditService = class AuditService {
    constructor(auditLogRepository, systemLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.systemLogRepository = systemLogRepository;
    }
    async create(data) {
        try {
            const log = this.auditLogRepository.create({
                ...data,
                entidad_id: data.entidad_id?.toString(),
                valor_anterior: data.valor_anterior
                    ? JSON.stringify(data.valor_anterior)
                    : null,
                valor_nuevo: data.valor_nuevo ? JSON.stringify(data.valor_nuevo) : null,
            });
            log.hash = this.generateHash(log);
            return await this.auditLogRepository.save(log);
        }
        catch (error) {
            console.error('Error creating audit log:', error);
        }
    }
    generateHash(log) {
        const crypto = require('crypto');
        const dataToSign = `${log.usuario_id || 'anon'}:${log.accion}:${log.modulo}:${log.entidad_id || ''}:${log.valor_anterior || ''}:${log.valor_nuevo || ''}`;
        return crypto.createHash('sha256').update(dataToSign).digest('hex');
    }
    async verifyIntegrity(limit = 100) {
        const logs = await this.auditLogRepository.find({
            order: { created_at: 'DESC' },
            take: limit,
        });
        const corruptedLogs = [];
        for (const log of logs) {
            if (!log.hash)
                continue;
            const currentHash = this.generateHash(log);
            if (currentHash !== log.hash) {
                corruptedLogs.push({
                    id: log.id,
                    expected: log.hash,
                    calculated: currentHash,
                    corrupted: true
                });
            }
        }
        return {
            valid: corruptedLogs.length === 0,
            corruptedLogs
        };
    }
    async findAll(query = {}) {
        const { limit = 100, offset = 0, modulo, usuario_id, startDate, endDate } = query;
        const qb = this.auditLogRepository.createQueryBuilder('log')
            .leftJoinAndSelect('log.usuario', 'usuario')
            .orderBy('log.created_at', 'DESC')
            .take(limit)
            .skip(offset);
        if (modulo) {
            qb.andWhere('log.modulo = :modulo', { modulo });
        }
        if (usuario_id) {
            qb.andWhere('log.usuario_id = :usuario_id', { usuario_id });
        }
        if (startDate && endDate) {
            qb.andWhere('log.created_at BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        return await qb.getManyAndCount();
    }
    async logSystem(data) {
        try {
            const manager = data.queryRunner ? data.queryRunner.manager : this.systemLogRepository.manager;
            const log = manager.create(system_log_entity_1.SystemLog, {
                transaction_id: data.transaction_id,
                modulo: data.modulo,
                accion: data.accion,
                usuario_id: data.usuario_id,
                detalles: data.detalles ? (typeof data.detalles === 'string' ? data.detalles : JSON.stringify(data.detalles)) : null,
                entidad_id: data.entidad_id,
                entidad_tipo: data.entidad_tipo,
                ip: data.ip
            });
            await manager.save(system_log_entity_1.SystemLog, log);
        }
        catch (error) {
            console.error('Error logging to SystemLog:', error);
            if (data.queryRunner && data.queryRunner.isTransactionActive) {
                throw error;
            }
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(1, (0, typeorm_1.InjectRepository)(system_log_entity_1.SystemLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map