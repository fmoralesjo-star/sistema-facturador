import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { SystemLog } from './entities/system-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
        @InjectRepository(SystemLog)
        private systemLogRepository: Repository<SystemLog>,
    ) { }

    async create(data: {
        usuario_id?: number;
        usuario_nombre?: string;
        accion: string;
        modulo: string;
        entidad_id?: string | number;
        valor_anterior?: any;
        valor_nuevo?: any;
        ip_address?: string;
        user_agent?: string;
    }) {
        try {
            const log = this.auditLogRepository.create({
                ...data,
                entidad_id: data.entidad_id?.toString(),
                valor_anterior: data.valor_anterior
                    ? JSON.stringify(data.valor_anterior)
                    : null,
                valor_nuevo: data.valor_nuevo ? JSON.stringify(data.valor_nuevo) : null,
            });

            // Generar Firma (Hash)
            log.hash = this.generateHash(log);

            return await this.auditLogRepository.save(log);
        } catch (error) {
            console.error('Error creating audit log:', error);
            // Fail silently to not block main business logic
        }
    }

    private generateHash(log: AuditLog): string {
        const crypto = require('crypto');
        // Datos a firmar: usuario + accion + modulo + fecha (aprox) + datos
        const dataToSign = `${log.usuario_id || 'anon'}:${log.accion}:${log.modulo}:${log.entidad_id || ''}:${log.valor_anterior || ''}:${log.valor_nuevo || ''}`;
        return crypto.createHash('sha256').update(dataToSign).digest('hex');
    }

    async verifyIntegrity(limit: number = 100): Promise<{ valid: boolean; corruptedLogs: any[] }> {
        const logs = await this.auditLogRepository.find({
            order: { created_at: 'DESC' },
            take: limit,
        });

        const corruptedLogs = [];

        for (const log of logs) {
            if (!log.hash) continue; // Logs antiguos sin hash se ignoran
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

    async findAll(query: any = {}) {
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

    async logSystem(data: {
        transaction_id?: string;
        modulo: string;
        accion: string;
        usuario_id?: number;
        detalles?: any;
        entidad_id?: number;
        entidad_tipo?: string;
        ip?: string;
        queryRunner?: QueryRunner;
    }) {
        try {
            const manager = data.queryRunner ? data.queryRunner.manager : this.systemLogRepository.manager;

            const log = manager.create(SystemLog, {
                transaction_id: data.transaction_id,
                modulo: data.modulo,
                accion: data.accion,
                usuario_id: data.usuario_id,
                detalles: data.detalles ? (typeof data.detalles === 'string' ? data.detalles : JSON.stringify(data.detalles)) : null,
                entidad_id: data.entidad_id,
                entidad_tipo: data.entidad_tipo,
                ip: data.ip
            });

            await manager.save(SystemLog, log);
        } catch (error) {
            console.error('Error logging to SystemLog:', error);
            // Non-blocking failure
            // En un sistema ACID estricto, ¿el fallo de auditoría debería revertir todo?
            // Generalmente sí para cumplimiento, pero por robustez de operación a veces no.
            // Asumiremos que es crítico y relanzamos si falla guardado dentro de Tx.
            if (data.queryRunner && data.queryRunner.isTransactionActive) {
                throw error;
            }
        }
    }
}
