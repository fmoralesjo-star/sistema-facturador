import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: any): Promise<[import("./entities/audit-log.entity").AuditLog[], number]>;
}
