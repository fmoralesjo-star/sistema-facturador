import { Repository } from 'typeorm';
import { ConciliacionBancaria } from './entities/conciliacion-bancaria.entity';
import { MovimientoBancarioExtracto } from './entities/movimiento-bancario-extracto.entity';
import { CreateConciliacionDto } from './dto/create-conciliacion.dto';
import { BancosService } from '../bancos/bancos.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { ConciliacionIAService } from './conciliacion-ia.service';
export declare class ConciliacionesService {
    private conciliacionRepository;
    private extractoRepository;
    private bancosService;
    private contabilidadService;
    private conciliacionIAService;
    constructor(conciliacionRepository: Repository<ConciliacionBancaria>, extractoRepository: Repository<MovimientoBancarioExtracto>, bancosService: BancosService, contabilidadService: ContabilidadService, conciliacionIAService: ConciliacionIAService);
    create(createConciliacionDto: CreateConciliacionDto): Promise<ConciliacionBancaria>;
    findAll(): Promise<ConciliacionBancaria[]>;
    findByBanco(bancoId: number): Promise<ConciliacionBancaria[]>;
    findByFactura(facturaId: number): Promise<ConciliacionBancaria[]>;
    findAllExtracto(bancoId: number): Promise<MovimientoBancarioExtracto[]>;
    findOne(id: number): Promise<ConciliacionBancaria>;
    update(id: number, updateData: Partial<CreateConciliacionDto>): Promise<ConciliacionBancaria>;
    conciliar(id: number): Promise<ConciliacionBancaria>;
    remove(id: number): Promise<void>;
    sincronizarConFactura(facturaId: number, pagos: any[]): Promise<void>;
    importarExtracto(bancoId: number, datosCSV: string): Promise<{
        importados: number;
        duplicados: number;
    }>;
    conciliarAutomatico(bancoId: number): Promise<number>;
    procesarExtractoIA(data: any[], bancoId: number): Promise<import("./entities/transaccion-bancaria.entity").TransaccionBancaria[]>;
    getPendientesIA(bancoId?: number): Promise<import("./entities/transaccion-bancaria.entity").TransaccionBancaria[]>;
    getSugerenciasIA(transaccionId: number): Promise<import("./conciliacion-ia.service").SugerenciaMatch[]>;
    confirmarMatchIA(transaccionId: number, conciliacionId: number): Promise<import("./entities/transaccion-bancaria.entity").TransaccionBancaria>;
    getEstadisticasIA(bancoId?: number): Promise<{
        total: number;
        pendientes: number;
        conciliadas: number;
        porcentajeConciliado: string | number;
    }>;
}
