import { CajaChicaService } from './caja-chica.service';
import { CreateCajaChicaMovimientoDto } from './dto/create-caja-chica-movimiento.dto';
export declare class CajaChicaController {
    private readonly cajaChicaService;
    constructor(cajaChicaService: CajaChicaService);
    registrarMovimiento(createDto: CreateCajaChicaMovimientoDto): Promise<import("./entities/caja-chica-movimiento.entity").CajaChicaMovimiento>;
    obtenerSaldoActual(puntoVentaId: number): Promise<number>;
    obtenerHistorial(puntoVentaId: number, fechaInicio?: string, fechaFin?: string): Promise<import("./entities/caja-chica-movimiento.entity").CajaChicaMovimiento[]>;
}
