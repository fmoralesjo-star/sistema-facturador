import { Repository, DataSource } from 'typeorm';
import { Factura } from '../../facturas/entities/factura.entity';
import { SriService } from '../sri.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { PostgresQueueService } from '../../common/services/postgres-queue.service';
import { ContabilidadService } from '../../contabilidad/contabilidad.service';
export declare class SriProcessor {
    private readonly sriService;
    private facturaRepository;
    private readonly circuitBreakerService;
    private readonly queueService;
    private readonly contabilidadService;
    private readonly dataSource;
    private readonly logger;
    private isProcessing;
    constructor(sriService: SriService, facturaRepository: Repository<Factura>, circuitBreakerService: CircuitBreakerService, queueService: PostgresQueueService, contabilidadService: ContabilidadService, dataSource: DataSource);
    handleCron(): Promise<void>;
    processNextJob(): Promise<void>;
}
