import { Repository } from 'typeorm';
import { LiquidacionCompra } from '../entities/liquidacion-compra.entity';
import { CreateLiquidacionDto } from '../dto/create-liquidacion.dto';
export declare class LiquidacionesService {
    private liquidacionRepository;
    private readonly logger;
    constructor(liquidacionRepository: Repository<LiquidacionCompra>);
    create(createDto: CreateLiquidacionDto): Promise<LiquidacionCompra>;
    findAll(filtros?: {
        desde?: Date;
        hasta?: Date;
        estado?: string;
    }): Promise<LiquidacionCompra[]>;
    findOne(id: number): Promise<LiquidacionCompra>;
    anular(id: number): Promise<LiquidacionCompra>;
    private obtenerSiguienteSecuencial;
}
