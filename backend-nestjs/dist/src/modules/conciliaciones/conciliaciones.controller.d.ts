import { ConciliacionesService } from './conciliaciones.service';
import { CreateConciliacionDto } from './dto/create-conciliacion.dto';
export declare class ConciliacionesController {
    private readonly conciliacionesService;
    constructor(conciliacionesService: ConciliacionesService);
    create(createConciliacionDto: CreateConciliacionDto): Promise<import("./entities/conciliacion-bancaria.entity").ConciliacionBancaria>;
    findAll(bancoId?: string, facturaId?: string): Promise<import("./entities/conciliacion-bancaria.entity").ConciliacionBancaria[]>;
    findAllExtracto(bancoId: string): Promise<import("./entities/movimiento-bancario-extracto.entity").MovimientoBancarioExtracto[]>;
    findOne(id: string): Promise<import("./entities/conciliacion-bancaria.entity").ConciliacionBancaria>;
    update(id: string, updateData: Partial<CreateConciliacionDto>): Promise<import("./entities/conciliacion-bancaria.entity").ConciliacionBancaria>;
    conciliar(id: string): Promise<import("./entities/conciliacion-bancaria.entity").ConciliacionBancaria>;
    remove(id: string): Promise<void>;
    sincronizarConFactura(facturaId: string, pagos: any[]): Promise<void>;
    importarExtracto(body: {
        banco_id: number;
        csv: string;
    }): Promise<{
        importados: number;
        duplicados: number;
    }>;
    procesarExtractoIA(body: {
        data: any[];
        banco_id: number;
    }): Promise<import("./entities/transaccion-bancaria.entity").TransaccionBancaria[]>;
    getPendientes(bancoId?: string): Promise<import("./entities/transaccion-bancaria.entity").TransaccionBancaria[]>;
    getSugerenciasIA(id: string): Promise<import("./conciliacion-ia.service").SugerenciaMatch[]>;
    confirmarMatchIA(transaccionId: string, conciliacionId: number): Promise<import("./entities/transaccion-bancaria.entity").TransaccionBancaria>;
    getEstadisticasIA(bancoId?: string): Promise<{
        total: number;
        pendientes: number;
        conciliadas: number;
        porcentajeConciliado: string | number;
    }>;
}
