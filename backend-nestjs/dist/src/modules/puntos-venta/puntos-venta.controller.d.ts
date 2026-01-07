import { PuntosVentaService } from './puntos-venta.service';
import { CreatePuntoVentaDto } from './dto/create-punto-venta.dto';
import { UpdatePuntoVentaDto } from './dto/update-punto-venta.dto';
export declare class PuntosVentaController {
    private readonly puntosVentaService;
    constructor(puntosVentaService: PuntosVentaService);
    create(createPuntoVentaDto: CreatePuntoVentaDto): Promise<import("./entities/punto-venta.entity").PuntoVenta>;
    findAll(): Promise<import("./entities/punto-venta.entity").PuntoVenta[]>;
    findOne(id: number): Promise<import("./entities/punto-venta.entity").PuntoVenta>;
    update(id: number, updatePuntoVentaDto: UpdatePuntoVentaDto): Promise<import("./entities/punto-venta.entity").PuntoVenta>;
    remove(id: number): Promise<import("./entities/punto-venta.entity").PuntoVenta>;
}
