import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
export declare class PromocionesController {
    private readonly promocionesService;
    constructor(promocionesService: PromocionesService);
    findAll(): Promise<import("./entities/promocion.entity").Promocion[]>;
    create(createDto: CreatePromocionDto): Promise<import("./entities/promocion.entity").Promocion>;
    findOne(id: number): Promise<import("./entities/promocion.entity").Promocion>;
    update(id: number, updateDto: Partial<CreatePromocionDto>): Promise<import("./entities/promocion.entity").Promocion>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getPromocionesActivasPorProducto(productoId: number): Promise<import("./entities/promocion.entity").Promocion[]>;
}
