import { Repository } from 'typeorm';
import { TransaccionBancaria } from './entities/transaccion-bancaria.entity';
import { ConciliacionBancaria } from './entities/conciliacion-bancaria.entity';
export interface SugerenciaMatch {
    conciliacion: ConciliacionBancaria;
    score: number;
    razones: string[];
}
export declare class ConciliacionIAService {
    private transaccionRepo;
    private conciliacionRepo;
    private readonly logger;
    constructor(transaccionRepo: Repository<TransaccionBancaria>, conciliacionRepo: Repository<ConciliacionBancaria>);
    procesarExtracto(data: any[], bancoId: number): Promise<TransaccionBancaria[]>;
    getPendientes(bancoId?: number): Promise<TransaccionBancaria[]>;
    sugerirEmparejamientos(transaccionId: number): Promise<SugerenciaMatch[]>;
    private buscarCandidatos;
    private calcularMatches;
    private calcularSimilitudTexto;
    confirmarEmparejamiento(transaccionId: number, conciliacionId: number): Promise<TransaccionBancaria>;
    getEstadisticas(bancoId?: number): Promise<{
        total: number;
        pendientes: number;
        conciliadas: number;
        porcentajeConciliado: string | number;
    }>;
}
