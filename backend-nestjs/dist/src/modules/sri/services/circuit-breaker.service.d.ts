import { Repository } from 'typeorm';
import { Configuracion } from '../../admin/entities/configuracion.entity';
export declare class CircuitBreakerService {
    private readonly configuracionRepository;
    private readonly logger;
    private failureCount;
    private readonly FAILURE_THRESHOLD;
    private readonly RESET_TIMEOUT;
    private lastFailureTime;
    constructor(configuracionRepository: Repository<Configuracion>);
    registrarFallo(error: any): Promise<void>;
    registrarExito(): Promise<void>;
    private activarContingencia;
    isContingenciaActiva(): Promise<boolean>;
}
