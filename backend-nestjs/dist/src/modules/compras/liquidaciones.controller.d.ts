import { LiquidacionesService } from './services/liquidaciones.service';
import { CreateLiquidacionDto } from './dto/create-liquidacion.dto';
export declare class LiquidacionesController {
    private readonly liquidacionesService;
    constructor(liquidacionesService: LiquidacionesService);
    create(createDto: CreateLiquidacionDto): Promise<import("./entities/liquidacion-compra.entity").LiquidacionCompra>;
    findAll(desde?: string, hasta?: string, estado?: string): Promise<import("./entities/liquidacion-compra.entity").LiquidacionCompra[]>;
    findOne(id: number): Promise<import("./entities/liquidacion-compra.entity").LiquidacionCompra>;
    anular(id: number): Promise<import("./entities/liquidacion-compra.entity").LiquidacionCompra>;
}
