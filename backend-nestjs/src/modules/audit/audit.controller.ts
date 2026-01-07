import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    findAll(@Query() query: any) {
        return this.auditService.findAll(query);
    }
}
