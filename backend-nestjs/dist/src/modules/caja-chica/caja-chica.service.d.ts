import { Repository } from 'typeorm';
import { CajaChicaMovimiento } from './entities/caja-chica-movimiento.entity';
import { CreateCajaChicaMovimientoDto } from './dto/create-caja-chica-movimiento.dto';
export declare class CajaChicaService {
    private cajaChicaRepository;
    constructor(cajaChicaRepository: Repository<CajaChicaMovimiento>);
    registrarMovimiento(createDto: CreateCajaChicaMovimientoDto): Promise<CajaChicaMovimiento>;
    obtenerSaldoActual(puntoVentaId: number): Promise<number>;
    obtenerHistorial(puntoVentaId: number, fechaInicio?: string, fechaFin?: string): Promise<CajaChicaMovimiento[]>;
}
