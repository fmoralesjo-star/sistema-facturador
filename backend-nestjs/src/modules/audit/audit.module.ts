import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { SystemLog } from './entities/system-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Global() // Make it global so we can inject AuditService anywhere easily
@Module({
    imports: [TypeOrmModule.forFeature([AuditLog, SystemLog])],
    controllers: [AuditController],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }
