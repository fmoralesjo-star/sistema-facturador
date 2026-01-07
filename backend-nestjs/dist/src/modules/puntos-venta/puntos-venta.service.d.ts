import { Repository } from 'typeorm';
import { CreatePuntoVentaDto } from './dto/create-punto-venta.dto';
import { UpdatePuntoVentaDto } from './dto/update-punto-venta.dto';
import { PuntoVenta } from './entities/punto-venta.entity';
export declare class PuntosVentaService {
    private readonly puntoVentaRepository;
    constructor(puntoVentaRepository: Repository<PuntoVenta>);
    create(createDto: CreatePuntoVentaDto): Promise<PuntoVenta>;
    findAll(): Promise<PuntoVenta[]>;
    findOne(id: number): Promise<PuntoVenta>;
    update(id: number, updateDto: UpdatePuntoVentaDto): Promise<PuntoVenta>;
    remove(id: number): Promise<PuntoVenta>;
}
