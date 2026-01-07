import { Repository } from 'typeorm';
import { Promocion } from './entities/promocion.entity';
import { CreatePromocionDto } from './dto/create-promocion.dto';
export declare class PromocionesService {
    private promocionRepository;
    constructor(promocionRepository: Repository<Promocion>);
    findAll(): Promise<Promocion[]>;
    create(createDto: CreatePromocionDto): Promise<Promocion>;
    findOne(id: number): Promise<Promocion>;
    update(id: number, updateDto: Partial<CreatePromocionDto>): Promise<Promocion>;
    remove(id: number): Promise<{
        message: string;
    }>;
    findActivasPorProducto(productoId: number): Promise<Promocion[]>;
}
