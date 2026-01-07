import { Repository, QueryRunner } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { SystemLog } from './entities/system-log.entity';
export declare class AuditService {
    private auditLogRepository;
    private systemLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>, systemLogRepository: Repository<SystemLog>);
    create(data: {
        usuario_id?: number;
        usuario_nombre?: string;
        accion: string;
        modulo: string;
        entidad_id?: string | number;
        valor_anterior?: any;
        valor_nuevo?: any;
        ip_address?: string;
        user_agent?: string;
    }): Promise<AuditLog>;
    private generateHash;
    verifyIntegrity(limit?: number): Promise<{
        valid: boolean;
        corruptedLogs: any[];
    }>;
    findAll(query?: any): Promise<[AuditLog[], number]>;
    logSystem(data: {
        transaction_id?: string;
        modulo: string;
        accion: string;
        usuario_id?: number;
        detalles?: any;
        entidad_id?: number;
        entidad_tipo?: string;
        ip?: string;
        queryRunner?: QueryRunner;
    }): Promise<void>;
}
